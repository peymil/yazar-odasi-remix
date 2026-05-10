import { redirect, useLoaderData, useSearchParams, Link, useNavigate } from 'react-router';
import { prisma } from '~/.server/prisma';
import { requireAdmin } from '~/.server/admin';
import { useState, useRef, Fragment } from 'react';
import { Trash2, ChevronDown, ChevronRight, User, BookOpen, Megaphone, ChevronLeft, Search, Shield, ShieldOff, ShieldPlus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import type { Route } from './+types/route';

const PAGE_SIZE = 20;

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await requireAdmin(request);

  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') ?? 'users';
  const q = url.searchParams.get('q')?.trim() ?? '';
  const userPage = Math.max(1, Number(url.searchParams.get('userPage') ?? '1'));
  const projectPage = Math.max(1, Number(url.searchParams.get('projectPage') ?? '1'));
  const competitionPage = Math.max(1, Number(url.searchParams.get('competitionPage') ?? '1'));

  const ci = 'insensitive' as const;

  const userWhere = q
    ? {
        OR: [
          { email: { contains: q, mode: ci } },
          {
            user_profile: {
              some: {
                OR: [
                  { name: { contains: q, mode: ci } },
                  { current_title: { contains: q, mode: ci } },
                  { about: { contains: q, mode: ci } },
                  { contact_email: { contains: q, mode: ci } },
                ],
              },
            },
          },
        ],
      }
    : undefined;

  const projectWhere = q
    ? {
        OR: [
          { plot_title: { contains: q, mode: ci } },
          { hook: { contains: q, mode: ci } },
          { logline: { contains: q, mode: ci } },
          { synopsis: { contains: q, mode: ci } },
          { type: { contains: q, mode: ci } },
          { similar_works: { contains: q, mode: ci } },
          { user_profile_project_characters: { some: { OR: [{ name: { contains: q, mode: ci } }, { description: { contains: q, mode: ci } }] } } },
          { project_projectgenre: { some: { project_genre: { slug: { contains: q, mode: ci } } } } },
          { project_projecttag: { some: { project_tag: { slug: { contains: q, mode: ci } } } } },
          { user_profile: { user: { email: { contains: q, mode: ci } } } },
        ],
      }
    : undefined;

  const competitionWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: ci } },
          { description: { contains: q, mode: ci } },
          { content_type: { contains: q, mode: ci } },
          { company: { name: { contains: q, mode: ci } } },
        ],
      }
    : undefined;

  const [
    users,
    usersTotal,
    projects,
    projectsTotal,
    competitions,
    competitionsTotal,
    admins,
  ] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      orderBy: { id: 'asc' },
      skip: (userPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        admin: true,
        user_profile: {
          include: {
            user_profile_project: {
              include: {
                user_profile_project_characters: true,
                project_projectgenre: { include: { project_genre: true } },
                project_projecttag: { include: { project_tag: true } },
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where: userWhere }),

    prisma.user_profile_project.findMany({
      where: projectWhere,
      orderBy: { id: 'asc' },
      skip: (projectPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user_profile_project_characters: true,
        project_projectgenre: { include: { project_genre: true } },
        project_projecttag: { include: { project_tag: true } },
        user_profile: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    }),
    prisma.user_profile_project.count({ where: projectWhere }),

    prisma.competition.findMany({
      where: competitionWhere,
      orderBy: { id: 'asc' },
      skip: (competitionPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        company: true,
        deliveries: { include: { user: { select: { id: true, email: true } } } },
      },
    }),
    prisma.competition.count({ where: competitionWhere }),

    prisma.admin.findMany({
      orderBy: { id: 'asc' },
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);

  return {
    currentAdminUserId: currentUser.id,
    q,
    tab,
    users,
    userPage,
    userTotalPages: Math.max(1, Math.ceil(usersTotal / PAGE_SIZE)),
    usersTotal,
    projects,
    projectPage,
    projectTotalPages: Math.max(1, Math.ceil(projectsTotal / PAGE_SIZE)),
    projectsTotal,
    competitions,
    competitionPage,
    competitionTotalPages: Math.max(1, Math.ceil(competitionsTotal / PAGE_SIZE)),
    competitionsTotal,
    admins,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const currentUser = await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const returnTo = (formData.get('returnTo') as string) || '/admin';

  if (intent === 'delete-user') {
    const userId = Number(formData.get('userId'));
    if (userId === currentUser.id) {
      throw new Response('Kendinizi silemezsiniz.', { status: 403 });
    }
    await prisma.user.delete({ where: { id: userId } });
    return redirect(returnTo);
  }

  if (intent === 'delete-project') {
    const projectId = Number(formData.get('projectId'));
    await prisma.user_profile_project.delete({ where: { id: projectId } });
    return redirect(returnTo);
  }

  if (intent === 'delete-competition') {
    const competitionId = Number(formData.get('competitionId'));
    await prisma.competition.delete({ where: { id: competitionId } });
    return redirect(returnTo);
  }

  if (intent === 'grant-admin') {
    const email = (formData.get('email') as string)?.trim();
    if (!email) throw new Response('E-posta gerekli.', { status: 400 });
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) throw new Response('Kullanıcı bulunamadı.', { status: 404 });
    await prisma.admin.upsert({
      where: { user_id: target.id },
      update: {},
      create: { user_id: target.id },
    });
    return redirect(returnTo);
  }

  if (intent === 'revoke-admin') {
    const userId = Number(formData.get('userId'));
    if (userId === currentUser.id) {
      throw new Response('Kendi admin yetkınızı kaldıramazsınız.', { status: 403 });
    }
    await prisma.admin.delete({ where: { user_id: userId } });
    return redirect(returnTo);
  }

  throw new Response('Bad Request', { status: 400 });
}

type LoaderData = Awaited<ReturnType<typeof loader>>;
type UserData = LoaderData['users'][number];
type StandaloneProject = LoaderData['projects'][number];
type ProjectData = UserData['user_profile'][number]['user_profile_project'][number];
type CompetitionData = LoaderData['competitions'][number];
type AdminData = LoaderData['admins'][number];
type AnyProject = ProjectData | StandaloneProject;

function highlight(text: string | null | undefined, q: string): React.ReactNode {
  if (!q || !text) return text ?? null;
  const lower = text.toLowerCase();
  const lq = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i: number;
  while ((i = lower.indexOf(lq, last)) !== -1) {
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <mark key={i} className="bg-transparent text-[#F36D31] font-semibold not-italic">
        {text.slice(i, i + q.length)}
      </mark>,
    );
    last = i + q.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function ConfirmDeleteButton({ label, formData }: { label: string; formData: Record<string, string | number> }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form method="POST" className="inline-flex items-center gap-2">
        {Object.entries(formData).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={String(v)} />
        ))}
        <span className="text-sm text-red-600">Emin misiniz?</span>
        <Button type="submit" size="sm" variant="destructive">
          Evet, Sil
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setConfirming(false)}>
          İptal
        </Button>
      </form>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {label}
    </Button>
  );
}

// SearchInput

function SearchInput({ defaultValue }: { defaultValue: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (val.trim()) {
        next.set('q', val.trim());
      } else {
        next.delete('q');
      }
      // Reset all page params when query changes
      next.delete('userPage');
      next.delete('projectPage');
      next.delete('competitionPage');
      navigate(`/admin?${next.toString()}`, { replace: true });
    }, 300);
  };

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        placeholder="Kullanıcı, proje veya açık çağrı ara..."
        defaultValue={defaultValue}
        onChange={handleChange}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F36D31]/30 focus:border-[#F36D31] transition-colors"
      />
    </div>
  );
}

// Pagination

function Pagination({
  page,
  totalPages,
  paramKey,
}: {
  page: number;
  totalPages: number;
  paramKey: string;
}) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set(paramKey, String(p));
    return `/admin?${next.toString()}`;
  };

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-6" aria-label="Sayfalama">
      <Link
        to={buildHref(page - 1)}
        aria-disabled={page === 1}
        className={`p-1.5 rounded hover:bg-gray-100 ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`e${i}`} className="px-2 text-gray-400 select-none">...</span>
        ) : (
          <Link
            key={p}
            to={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
              p === page ? 'bg-[#F36D31] text-white' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        to={buildHref(page + 1)}
        aria-disabled={page === totalPages}
        className={`p-1.5 rounded hover:bg-gray-100 ${page === totalPages ? 'pointer-events-none opacity-30' : ''}`}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}

// Shared project accordion body

function ProjectAccordionBody({ project, returnTo, q }: { project: AnyProject; returnTo: string; q: string }) {
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm space-y-2">
      {project.image && (
        <img src={project.image} alt={project.plot_title} className="w-32 h-32 object-cover rounded mb-3" />
      )}
      <p><span className="font-semibold">Hook:</span> {highlight(project.hook, q)}</p>
      <p><span className="font-semibold">Logline:</span> {highlight(project.logline, q)}</p>
      <p><span className="font-semibold">Kısa Özet:</span> {highlight(project.synopsis, q)}</p>
      <p><span className="font-semibold">Tip:</span> {highlight(project.type, q)}</p>
      {project.similar_works && (
        <p><span className="font-semibold">Benzer İşler:</span> {highlight(project.similar_works, q)}</p>
      )}
      {project.project_projectgenre.length > 0 && (
        <p>
          <span className="font-semibold">Türler:</span>{' '}
          {project.project_projectgenre.map((pg, i) => (
            <Fragment key={pg.project_genre.slug}>
              {i > 0 && ', '}{highlight(pg.project_genre.slug, q)}
            </Fragment>
          ))}
        </p>
      )}
      {project.project_projecttag.length > 0 && (
        <p>
          <span className="font-semibold">Etiketler:</span>{' '}
          {project.project_projecttag.map((pt, i) => (
            <Fragment key={pt.project_tag.slug}>
              {i > 0 && ', '}{highlight(pt.project_tag.slug, q)}
            </Fragment>
          ))}
        </p>
      )}
      {project.user_profile_project_characters.length > 0 && (
        <div>
          <p className="font-semibold mb-1">Karakterler:</p>
          <ul className="list-disc pl-5 space-y-1">
            {project.user_profile_project_characters.map((char) => (
              <li key={char.id}>
                <span className="font-medium">{highlight(char.name, q)}:</span> {highlight(char.description, q)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="pt-2">
        <ConfirmDeleteButton
          label="Projeyi Sil"
          formData={{ intent: 'delete-project', projectId: project.id, returnTo }}
        />
      </div>
    </div>
  );
}

// ProjectAccordion (nested inside user accordion)

function ProjectAccordion({ project, returnTo, q }: { project: AnyProject; returnTo: string; q: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded mb-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-sm">
          <BookOpen className="w-4 h-4 text-[#F36D31]" />
          {highlight(project.plot_title || 'İsimsiz Proje', q)} — {highlight(project.type, q)}
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <ProjectAccordionBody project={project} returnTo={returnTo} q={q} />}
    </div>
  );
}

// StandaloneProjectAccordion (Projects tab)

function StandaloneProjectAccordion({ project, returnTo, q }: { project: StandaloneProject; returnTo: string; q: string }) {
  const [open, setOpen] = useState(false);
  const ownerEmail = project.user_profile?.user?.email;

  return (
    <div className="border border-gray-200 rounded mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#F36D31]" />
          <span>
            <span className="font-semibold">{highlight(project.plot_title || 'İsimsiz Proje', q)}</span>
            <span className="ml-2 text-gray-500 text-sm">
              {highlight(project.type, q)}{ownerEmail ? <> — {highlight(ownerEmail, q)}</> : null}
            </span>
          </span>
        </span>
        {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      {open && <ProjectAccordionBody project={project} returnTo={returnTo} q={q} />}
    </div>
  );
}

function UserAccordion({ user, returnTo, q, currentAdminUserId }: { user: UserData; returnTo: string; q: string; currentAdminUserId: number }) {
  const [open, setOpen] = useState(false);
  const profile = user.user_profile[0];

  return (
    <div className="border border-gray-200 rounded mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-3">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <span>
            <span className="font-semibold">{highlight(profile?.name || user.email, q)}</span>
            <span className="ml-2 text-gray-500 text-sm">#{user.id} — {highlight(user.email, q)}</span>
          </span>
        </span>
        {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-4">
          {/* Profile details */}
          {profile && (
            <div className="text-sm space-y-1">
              {profile.current_title && (
                <p><span className="font-semibold">Unvan:</span> {highlight(profile.current_title, q)}</p>
              )}
              {profile.about && (
                <p><span className="font-semibold">Hakkında:</span> {highlight(profile.about, q)}</p>
              )}
              {profile.contact_email && (
                <p><span className="font-semibold">İletişim E-posta:</span> {highlight(profile.contact_email, q)}</p>
              )}
            </div>
          )}

          {/* Projects */}
          {profile?.user_profile_project && profile.user_profile_project.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Projeler ({profile.user_profile_project.length})
              </h4>
              {profile.user_profile_project.map((project) => (
                <ProjectAccordion key={project.id} project={project} returnTo={returnTo} q={q} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Henüz proje yok.</p>
          )}

          <div className="pt-1 flex items-center gap-3 flex-wrap">
            {!user.admin && (
              <form method="POST" className="inline">
                <input type="hidden" name="intent" value="grant-admin" />
                <input type="hidden" name="email" value={user.email} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <Button type="submit" size="sm" variant="outline" className="flex items-center gap-1 border-[#5848BC] text-[#5848BC] hover:bg-[#5848BC]/10">
                  <ShieldPlus className="w-3.5 h-3.5" />
                  Admin Yap
                </Button>
              </form>
            )}
            {user.id !== currentAdminUserId ? (
              <ConfirmDeleteButton
                label="Kullanıcıyı Sil"
                formData={{ intent: 'delete-user', userId: user.id, returnTo }}
              />
            ) : (
              <span className="text-xs text-gray-400 italic">Kendinizi silemezsiniz</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitionAccordion({ competition, returnTo, q }: { competition: CompetitionData; returnTo: string; q: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded mb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-[#5848BC]" />
          <span>
            <span className="font-semibold">{highlight(competition.title, q)}</span>
            <span className="ml-2 text-gray-500 text-sm">{highlight(competition.company.name, q)}</span>
          </span>
        </span>
        {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-3 text-sm">
          {competition.avatar && (
            <img
              src={competition.avatar}
              alt={competition.title}
              className="w-40 h-28 object-cover rounded mb-3"
            />
          )}
          <p><span className="font-semibold">Açıklama:</span> {highlight(competition.description, q)}</p>
          <p>
            <span className="font-semibold">Tarihler:</span>{' '}
            {new Date(competition.start_date).toLocaleDateString('tr-TR')} –{' '}
            {new Date(competition.end_date).toLocaleDateString('tr-TR')}
          </p>
          {competition.content_type && (
            <p><span className="font-semibold">İçerik Tipi:</span> {highlight(competition.content_type, q)}</p>
          )}

          {/* Deliveries */}
          {competition.deliveries.length > 0 ? (
            <div>
              <p className="font-semibold mb-1">Başvurular ({competition.deliveries.length}):</p>
              <ul className="list-disc pl-5 space-y-1">
                {competition.deliveries.map((d) => (
                  <li key={d.id}>
                    {d.user.email} — <span className="font-medium">{d.status}</span>{' '}
                    ({new Date(d.created_at).toLocaleDateString('tr-TR')})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-400">Henüz başvuru yok.</p>
          )}

          <div className="pt-1">
            <ConfirmDeleteButton
              label="Açık Çağrıyı Sil"
              formData={{ intent: 'delete-competition', competitionId: competition.id, returnTo }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// AdminsTab

function AdminsTab({ admins, returnTo, currentAdminUserId }: { admins: AdminData[]; returnTo: string; currentAdminUserId: number }) {
  const [email, setEmail] = useState('');

  return (
    <section className="space-y-6">
      {/* Add admin form */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ShieldPlus className="w-4 h-4 text-[#5848BC]" />
          Yeni Admin Ekle
        </h3>
        <form method="POST" className="flex items-center gap-3" onSubmit={() => setEmail('')}>
          <input type="hidden" name="intent" value="grant-admin" />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kullanici@eposta.com"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5848BC]/30 focus:border-[#5848BC] transition-colors"
          />
          <Button type="submit" size="sm" className="bg-[#5848BC] hover:bg-[#4a3dad] text-white flex items-center gap-1.5">
            <ShieldPlus className="w-4 h-4" />
            Admin Yap
          </Button>
        </form>
      </div>

      {/* Existing admins */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Mevcut Adminler ({admins.length})
        </h3>
        <div className="space-y-2">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white border border-gray-200 rounded-lg px-5 py-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#5848BC]" />
                <span className="font-medium text-sm">{admin.user.email}</span>
                <span className="text-xs text-gray-400">#{admin.user.id}</span>
                {admin.user.id === currentAdminUserId && (
                  <span className="text-xs bg-[#5848BC]/10 text-[#5848BC] px-2 py-0.5 rounded-full font-medium">Siz</span>
                )}
              </span>
              {admin.user.id !== currentAdminUserId ? (
                <ConfirmDeleteButton
                  label="Yetkiyi Kaldır"
                  formData={{ intent: 'revoke-admin', userId: admin.user.id, returnTo }}
                />
              ) : (
                <span className="text-xs text-gray-400 italic flex items-center gap-1">
                  <ShieldOff className="w-3.5 h-3.5" />
                  Kaldırılamaz
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// TabLink

function TabLink({
  tabKey,
  active,
  activeColor,
  children,
}: {
  tabKey: string;
  active: boolean;
  activeColor: string;
  children: React.ReactNode;
}) {
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  next.set('tab', tabKey);

  return (
    <Link
      to={`/admin?${next.toString()}`}
      className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
        active ? `${activeColor} border-current` : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

export default function AdminPanel() {
  const {
    currentAdminUserId,
    q,
    tab,
    users, userPage, userTotalPages, usersTotal,
    projects, projectPage, projectTotalPages, projectsTotal,
    competitions, competitionPage, competitionTotalPages, competitionsTotal,
    admins,
  } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const returnTo = `/admin?${searchParams.toString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <SearchInput defaultValue={q} />

        <div className="flex gap-6 mb-6 border-b border-gray-200 flex-wrap">
          <TabLink tabKey="users" active={tab === 'users'} activeColor="text-[#F36D31]">
            <User className="w-4 h-4" />
            Kullanıcılar ({usersTotal})
          </TabLink>
          <TabLink tabKey="projects" active={tab === 'projects'} activeColor="text-[#F36D31]">
            <BookOpen className="w-4 h-4" />
            Projeler ({projectsTotal})
          </TabLink>
          <TabLink tabKey="competitions" active={tab === 'competitions'} activeColor="text-[#5848BC]">
            <Megaphone className="w-4 h-4" />
            Açık Çağrılar ({competitionsTotal})
          </TabLink>
          <TabLink tabKey="admins" active={tab === 'admins'} activeColor="text-[#5848BC]">
            <Shield className="w-4 h-4" />
            Adminler ({admins.length})
          </TabLink>
        </div>

        {tab === 'users' && (
          <section>
            <h2 className="text-lg font-semibold text-[#231f20] mb-4">
              {q
                ? <><span className="text-[#F36D31]">&ldquo;{q}&rdquo;</span> için {usersTotal} kullanıcı bulundu</>
                : <>Tüm Kullanıcılar — sayfa {userPage} / {userTotalPages}</>
              }
            </h2>
            {users.length === 0 ? (
              <p className="text-gray-400">{q ? `"${q}" aramasına uygun kullanıcı bulunamadı.` : 'Kullanıcı bulunamadı.'}</p>
            ) : (
              users.map((user) => (
                <UserAccordion key={user.id} user={user} returnTo={returnTo} q={q} currentAdminUserId={currentAdminUserId} />
              ))
            )}
            <Pagination page={userPage} totalPages={userTotalPages} paramKey="userPage" />
          </section>
        )}

        {tab === 'projects' && (
          <section>
            <h2 className="text-lg font-semibold text-[#231f20] mb-4">
              {q
                ? <><span className="text-[#F36D31]">&ldquo;{q}&rdquo;</span> için {projectsTotal} proje bulundu</>
                : <>Tüm Projeler — sayfa {projectPage} / {projectTotalPages}</>
              }
            </h2>
            {projects.length === 0 ? (
              <p className="text-gray-400">{q ? `"${q}" aramasına uygun proje bulunamadı.` : 'Proje bulunamadı.'}</p>
            ) : (
              projects.map((project) => (
                <StandaloneProjectAccordion key={project.id} project={project} returnTo={returnTo} q={q} />
              ))
            )}
            <Pagination page={projectPage} totalPages={projectTotalPages} paramKey="projectPage" />
          </section>
        )}

        {tab === 'competitions' && (
          <section>
            <h2 className="text-lg font-semibold text-[#231f20] mb-4">
              {q
                ? <><span className="text-[#F36D31]">&ldquo;{q}&rdquo;</span> için {competitionsTotal} açık çağrı bulundu</>
                : <>Tüm Açık Çağrılar — sayfa {competitionPage} / {competitionTotalPages}</>
              }
            </h2>
            {competitions.length === 0 ? (
              <p className="text-gray-400">{q ? `"${q}" aramasına uygun açık çağrı bulunamadı.` : 'Açık çağrı bulunamadı.'}</p>
            ) : (
              competitions.map((c) => (
                <CompetitionAccordion key={c.id} competition={c} returnTo={returnTo} q={q} />
              ))
            )}
            <Pagination page={competitionPage} totalPages={competitionTotalPages} paramKey="competitionPage" />
          </section>
        )}

        {tab === 'admins' && (
          <AdminsTab admins={admins} returnTo={returnTo} currentAdminUserId={currentAdminUserId} />
        )}
      </div>
    </div>
  );
}

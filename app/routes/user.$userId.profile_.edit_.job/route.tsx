import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { profileExperienceCreateSchema } from '~/.server/schemas/profile-experience-create.schema';
import { prisma } from '~/.server/prisma';
import { Route } from './+types/route';
import { redirect, Link } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
  const body = Object.fromEntries(await request.formData());
  const experience = await profileExperienceCreateSchema.parse(body);

  prisma.user_profile_experience.create({
    data: experience,
  });

  // navigate user back
  return redirect('..');
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-white px-10 py-5">
      {/* Back Link */}
      <Link
        to=".."
        relative="path"
        className="flex items-center gap-3 text-[#231f20] text-xl hover:text-[#F36D31] transition-colors w-fit mb-8"
      >
        <svg width="32" height="29" viewBox="0 0 32 29" fill="none">
          <path
            d="M14.5 1C14.5 1 1 7.5 1 14.5C1 21.5 14.5 28 14.5 28"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M3 14.5H31" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="font-ibm-plex-sans">Profile Dön</span>
      </Link>

      <form method="POST" className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 gap-10">
          {/* Left Column */}
          <div>
            {/* Photo Placeholder */}
            <div className="w-full h-[470px] bg-gray-200 mb-12"></div>

            {/* Synopsis Section */}
            <div className="mb-12">
              <h3 className="font-inter text-xl text-[#231f20] mb-3">Kısa Özet</h3>
              <div className="border border-[#231f20] rounded p-4 h-40">
                <p className="font-inter text-[15px] text-[#231f20] leading-relaxed">
                  {/* Synopsis preview will show here */}
                </p>
              </div>
            </div>

            {/* Similar Works Section */}
            <div className="mb-12">
              <h3 className="font-inter text-xl text-[#231f20] mb-3">Benzer İşler</h3>
              <div className="border border-[#231f20] rounded p-4 min-h-[42px]">
                <div className="flex flex-wrap gap-2">
                  {/* Similar works tags will appear here */}
                </div>
              </div>
            </div>

            {/* Document Upload Buttons */}
            <div className="flex gap-7 mb-12">
              <Button
                type="button"
                className="bg-[#F36D31] hover:bg-[#E05520] text-white font-playfair-display font-semibold text-xs rounded px-6 py-2"
              >
                leopoldun_sabunu.pdf
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border border-[#F36D31] text-[#F36D31] hover:bg-[#F36D31] hover:text-white font-playfair-display font-semibold text-xs rounded px-6 py-2"
              >
                linki güncelle
              </Button>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="bg-[#5848BC] hover:bg-[#4839A3] text-white font-playfair-display font-semibold text-xs rounded px-12 py-2 flex items-center gap-2"
            >
              <svg width="23" height="21" viewBox="0 0 23 21" fill="none">
                <path
                  d="M1 11L7.5 19L22 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              kaydet
            </Button>
          </div>

          {/* Right Column - Form Fields */}
          <div>
            {/* İş Adı */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">İş Adı</Label>
              <Input
                name="title"
                className="border border-[#231f20] rounded px-4 py-2 font-ibm-plex-sans text-[15px]"
                type="text"
                placeholder="İş adını giriniz"
                required
              />
            </div>

            {/* İş Tipi */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">İş Tipi</Label>
              <Input
                name="company_name"
                className="border border-[#231f20] rounded px-4 py-2 font-ibm-plex-sans text-[15px]"
                type="text"
                placeholder="Şirket adını giriniz"
                required
              />
            </div>

            {/* Hook */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Hook</Label>
              <Input
                name="setting"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20]"
                type="text"
                placeholder="Konum giriniz"
                required
              />
            </div>

            {/* Logline */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Logline</Label>
              <Textarea
                name="description"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20] min-h-[64px]"
                placeholder="Açıklama giriniz"
                required
              />
            </div>

            {/* Başlangıç Tarihi */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Başlangıç Tarihi</Label>
              <Input
                name="start_date"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20]"
                type="date"
                required
              />
            </div>

            {/* Bitiş Tarihi */}
            <div className="mb-8">
              <Label className="font-inter text-xl text-[#231f20] mb-2 block">Bitiş Tarihi</Label>
              <Input
                name="end_date"
                className="border border-[#231f20] rounded px-4 py-2 font-inter text-[15px] text-[#231f20]"
                type="date"
                required
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


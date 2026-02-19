-- @param {Int} $1:userId

SELECT
    c.id,
    c.title,
    c.end_date,
    c.avatar,
    c.content_type,
    cp.name as company_name,
    cb.created_at as bookmarked_at
FROM competition c
INNER JOIN competition_bookmark cb ON c.id = cb.competition_id
LEFT JOIN company_profile cp ON c.company_id = cp.company_id
WHERE cb.user_id = $1
ORDER BY cb.created_at DESC

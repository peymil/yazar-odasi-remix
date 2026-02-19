-- @param {Int} $1:userId

SELECT
    cd.id as delivery_id,
    cd.status,
    cd.created_at as submitted_at,
    c.id,
    c.title,
    c.end_date,
    c.content_type,
    cp.name as company_name
FROM competition_delivery cd
INNER JOIN competition c ON cd.competition_id = c.id
LEFT JOIN company_profile cp ON c.company_id = cp.company_id
WHERE cd.user_id = $1
ORDER BY cd.created_at DESC

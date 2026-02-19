-- @param {String} $1:SearchString
-- @param {Int} $2:Limit
-- @param {Int} $3:Offset

SELECT 
    c.*,
    cp.name as company_name,
    COUNT(cd.id) as delivery_count,
    COUNT(*) OVER() as total_count
FROM competition c
LEFT JOIN company_profile cp ON c.company_id = cp.company_id
LEFT JOIN competition_delivery cd ON c.id = cd.competition_id
WHERE 
    c.title ILIKE '%' || $1 || '%' OR 
    c.description ILIKE '%' || $1 || '%'
GROUP BY c.id, cp.name
ORDER BY 
    CASE 
        WHEN c.end_date >= CURRENT_DATE THEN 0 
        ELSE 1 
    END,
    c.end_date ASC
LIMIT $2 OFFSET $3

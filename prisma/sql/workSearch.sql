-- @param {String} $1:SearchString
-- @param {Int} $2:Limit
-- @param {Int} $3:Offset

SELECT 
    w.*,
    up.user_id,
    array_agg(DISTINCT jsonb_build_object(
        'id', pg.id,
        'genre_name', pg.genre_name
    )) FILTER (WHERE pg.id IS NOT NULL) as genres,
    array_agg(DISTINCT jsonb_build_object(
        'id', pt.id,
        'tag_name', pt.tag_name
    )) FILTER (WHERE pt.id IS NOT NULL) as tags,
    COUNT(*) OVER() as total_count
FROM user_profile_work w
JOIN user_profile up ON w.profile_id = up.id
LEFT JOIN work_projectgenre wpg ON w.id = wpg.work_id
LEFT JOIN project_genre pg ON wpg.project_genre_id = pg.id
LEFT JOIN work_projecttag wpt ON w.id = wpt.work_id
LEFT JOIN project_tag pt ON wpt.project_tag_id = pt.id
WHERE w.plot_title ILIKE '%' || $1 || '%'
GROUP BY w.id, up.user_id
ORDER BY w.plot_title
LIMIT $2 OFFSET $3
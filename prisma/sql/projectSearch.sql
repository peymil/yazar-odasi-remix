-- @param {String} $1:SearchString
-- @param {Int} $2:Limit
-- @param {Int} $3:Offset

SELECT 
    p.*,
    up.user_id,
    array_agg(DISTINCT jsonb_build_object(
         pg.id,
         pg.genre_name
    )) as genres,
    array_agg(DISTINCT jsonb_build_object(
         pt.id,
         pt.tag_name
    )) as tags
FROM user_profile_project p
JOIN user_profile up ON p.profile_id = up.id
LEFT JOIN project_projectgenre ppg ON p.id = ppg.project_id
LEFT JOIN project_genre pg ON ppg.project_genre_id = pg.id
LEFT JOIN project_projecttag ppt ON p.id = ppt.project_id
LEFT JOIN project_tag pt ON ppt.project_tag_id = pt.id
WHERE p.plot_title ILIKE $1
GROUP BY p.id, up.user_id
ORDER BY p.plot_title
LIMIT $2 OFFSET $3
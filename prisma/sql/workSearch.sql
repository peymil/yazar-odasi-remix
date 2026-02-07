-- @param {String} $1:SearchString
-- @param {Int} $2:Limit
-- @param {Int} $3:Offset

SELECT 
    w.*,
    up.user_id,
    array_agg(DISTINCT jsonb_build_object(
        'id', wg.id,
        'genre_name', wg.genre_name
    )) as genres,
    array_agg(DISTINCT jsonb_build_object(
        'id', wt.id,
        'tag_name', wt.tag_name
    )) as tags
FROM user_profile_work w
JOIN user_profile up ON w.profile_id = up.id
LEFT JOIN work_workgenre wwg ON w.id = wwg.work_id
LEFT JOIN work_genre wg ON wwg.work_genre_id = wg.id
LEFT JOIN work_worktag wwt ON w.id = wwt.work_id
LEFT JOIN work_tag wt ON wwt.work_tag_id = wt.id
WHERE w.plot_title ILIKE $1
GROUP BY w.id, up.user_id
ORDER BY w.plot_title
LIMIT $2 OFFSET $3
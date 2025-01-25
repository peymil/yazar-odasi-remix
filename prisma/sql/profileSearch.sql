-- @param {String} $1:SearchString
-- @param {Int} $2:Limit
-- @param {Int} $3:Offset
SELECT up.id,
    up.user_id,
    up.current_title,
    up.about,
    u.email,
    u.image,
    up.name,
    COUNT(*) OVER() as total_count
FROM user_profile up
    INNER JOIN "user" u ON up.user_id = u.id
WHERE up.name ILIKE '%' || $1 || '%'
LIMIT $2 OFFSET $3
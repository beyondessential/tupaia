DELETE FROM refresh_token WHERE id IN
	(SELECT id FROM
		(SELECT id, user_id, device, rank() OVER (PARTITION BY user_id, device ORDER BY id DESC) FROM refresh_token) as foo
	WHERE rank > 1);

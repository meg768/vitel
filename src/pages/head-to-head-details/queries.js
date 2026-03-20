const sqlFiles = import.meta.glob('./queries/*.sql', {
	query: '?raw',
	import: 'default',
	eager: true
});

function filenameFromPath(path) {
	return path.split('/').pop() ?? path;
}

function parseQueryFile(raw, filename) {
	const text = raw ?? '';
	const commentMatch = text.match(/\/\*([\s\S]*?)\*\//);

	let title = null;
	let description = null;

	if (commentMatch) {
		const comment = commentMatch[1];
		const titleMatch = comment.match(/@title\s*([\s\S]*?)(?=@\w+|\s*$)/i);
		const descriptionMatch =
			comment.match(/@description\s*([\s\S]*?)(?=@\w+|\s*$)/i) ??
			comment.match(/@desciption\s*([\s\S]*?)(?=@\w+|\s*$)/i);

		title = titleMatch ? titleMatch[1].trim() : null;
		description = descriptionMatch ? descriptionMatch[1].trim() : null;
	}

	const sql = commentMatch ? text.replace(commentMatch[0], '').trim() : text.trim();
	const fallbackTitle = filename.replace(/^\d+[-_]?/, '').replace(/\.sql$/i, '').replace(/[-_]/g, ' ');

	return {
		title: title && title.length ? title : fallbackTitle,
		description: description && description.length ? description : null,
		sql
	};
}

function compileNamedPlaceholders(sql, values) {
	const format = [];

	const compiledSql = sql.replace(/:(playerA|playerB)\b/g, (_, key) => {
		format.push(values[key]);
		return '?';
	});

	return {
		sql: compiledSql,
		format
	};
}

const headToHeadQueries = Object.entries(sqlFiles)
	.map(([path, raw]) => {
		const filename = filenameFromPath(path);
		const parsed = parseQueryFile(raw, filename);

		return {
			id: path,
			filename,
			title: parsed.title,
			description: parsed.description,
			sql: parsed.sql
		};
	})
	.sort((a, b) => a.filename.localeCompare(b.filename, 'sv', { numeric: true }));

function buildHeadToHeadQueryBatch({ playerA, playerB }) {
	const statements = [];
	const format = [];

	for (const query of headToHeadQueries) {
		const compiled = compileNamedPlaceholders(query.sql, { playerA, playerB });
		let sql = compiled.sql.trim();

		if (!sql.endsWith(';')) {
			sql += ';';
		}

		statements.push(sql);
		format.push(...compiled.format);
	}

	return {
		sql: statements.join('\n'),
		format
	};
}

export { headToHeadQueries, buildHeadToHeadQueryBatch };

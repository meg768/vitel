// Load all SQL files in this folder, raw content, eagerly
const sqlFiles = import.meta.glob('../queries/*.sql', {
	query: '?raw',
	import: 'default',
	eager: true
});

function filenameFromPath(path) {
	return path.split('/').pop() ?? path;
}

function nameFromFilename(filename) {
	// Filnamn utan .sql → används direkt i URL
	return filename.replace(/\.sql$/i, '');
}

function parseQueryFile(raw, filename) {
	const text = raw ?? '';

	// Hitta första /* ... */-blocket (multiline)
	const commentMatch = text.match(/\/\*([\s\S]*?)\*\//);

	let title = null;
	let description = null;

	if (commentMatch) {
		const comment = commentMatch[1];

		const titleMatch = comment.match(/@title\s*([\s\S]*?)(?=@\w+|\s*$)/i);
		const descMatch = comment.match(/@description\s*([\s\S]*?)(?=@\w+|\s*$)/i);

		title = titleMatch ? titleMatch[1].trim() : null;
		description = descMatch ? descMatch[1].trim() : null;
	}

	// Ta bort första kommentaren (metadata)
	let sql = commentMatch ? text.replace(commentMatch[0], '') : text;

    const fallbackTitle = nameFromFilename(filename).replace(/[-_]/g, ' ');

	return {
		title: title && title.length ? title : fallbackTitle,
		description: description && description.length ? description : `SQL från filen ${filename}`,
		sql
	};
}

// Bygg färdig lista
export const queries = Object.entries(sqlFiles)
	.map(([path, raw]) => {
		const filename = filenameFromPath(path);
		const name = nameFromFilename(filename);
		const parsed = parseQueryFile(raw, filename);

		return {
			id: path, // unik internt
			name, // URL-id
			filename,
			title: parsed.title,
			description: parsed.description,
			sql: parsed.sql
		};
	})
	.sort((a, b) => a.title.localeCompare(b.title, 'sv'));

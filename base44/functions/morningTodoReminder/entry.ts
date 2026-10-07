import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Sam's morning to-do reminder. Runs on a daily schedule: every artist with
// open to-dos gets one short email listing what's left this week. Artists
// with nothing open are left alone.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const [allUsers, openTodos] = await Promise.all([
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.ArtistTodo.filter({ done: false }, '-created_date', 1000).catch(() => []),
    ]);

    const todosByUser = new Map();
    for (const todo of openTodos) {
      if (!todo.user_id || !todo.title) continue;
      if (!todosByUser.has(todo.user_id)) todosByUser.set(todo.user_id, []);
      todosByUser.get(todo.user_id).push(todo);
    }

    let emailsSent = 0;
    let skipped = 0;
    for (const user of allUsers) {
      const todos = todosByUser.get(user.id) || [];
      if (!todos.length) continue;
      if (!user.email) { skipped++; continue; }

      const firstName = String(user.full_name || 'there').split(' ')[0];
      const todoLines = todos
        .slice(0, 8)
        .map(t => `&bull; ${String(t.title).replace(/</g, '&lt;')}`)
        .join('<br>');

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          template_name: 'MorningTodoReminder',
          variables: {
            first_name: firstName,
            todo_lines: todoLines,
            todo_count: todos.length,
          },
        });
        emailsSent++;
      } catch (err) {
        console.log(`morningTodoReminder: failed for ${user.id}: ${err?.message || err}`);
        skipped++;
      }
    }

    console.log(`morningTodoReminder: ${emailsSent} sent, ${skipped} skipped, ${todosByUser.size} artists with open todos`);
    return Response.json({ success: true, emails_sent: emailsSent, skipped, artists_with_open_todos: todosByUser.size });
  } catch (error) {
    console.error('morningTodoReminder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import type { NewsPost } from "@/lib/news";

interface NewsFormProps {
  action: (formData: FormData) => Promise<void>;
  post?: NewsPost;
  submitLabel: string;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Shared by "New post" and "Edit post". */
export default function NewsForm({ action, post, submitLabel }: NewsFormProps) {
  return (
    <form action={action} className="card mt-4 space-y-4 p-4">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" className="input" required maxLength={150} defaultValue={post?.title} />
      </div>
      <div>
        <label className="label" htmlFor="summary">Summary</label>
        <input id="summary" name="summary" className="input" maxLength={300} defaultValue={post?.summary} />
      </div>
      <div>
        <label className="label" htmlFor="published_at">Date</label>
        <input id="published_at" name="published_at" type="date" className="input sm:max-w-56" required defaultValue={post?.date ?? today()} />
      </div>
      <div>
        <label className="label" htmlFor="body">Message</label>
        <textarea id="body" name="body" className="input min-h-72" required maxLength={20000} defaultValue={post?.body} />
      </div>
      <button type="submit" className="btn btn-primary">{submitLabel}</button>
    </form>
  );
}

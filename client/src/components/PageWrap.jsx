export default function PageWrap({ title, path }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-600">Route: {path}</p>
    </div>
  );
}

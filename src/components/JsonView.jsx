export default function JsonView({ data }) {
  return (
    <pre className="json-view">{JSON.stringify(data, null, 2)}</pre>
  );
}

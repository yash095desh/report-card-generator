/** Bilingual label: Hindi over English for Hindi-medium students, English only otherwise (as on v1's sheet). */
export function Bi({ en, hi, hindi }: { en: string; hi: string; hindi: boolean }) {
  if (!hindi) return <>{en}</>;
  return (
    <>
      <span className="hi">{hi}</span>
      <br />
      {en}
    </>
  );
}

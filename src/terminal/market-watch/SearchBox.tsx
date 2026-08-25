type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <input
      className="search-box"
      placeholder="Search symbols"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

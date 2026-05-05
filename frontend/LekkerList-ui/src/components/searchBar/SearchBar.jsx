// Search input with submit button
import { useEffect, useState } from "react";
import "./SearchBar.css";
import IconSearch from "../../images/search.svg?react";

export default function SearchBar({ onSearch, query = "" }) {
  const [localQuery, setLocalQuery] = useState("query");

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(localQuery);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleClear = () => {
    setLocalQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <form className="searchForm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search products..."
        value={localQuery}
        onChange={handleChange}
      />
      {localQuery && (
        <button
          type="button"
          className="searchClearBtn"
          onClick={handleClear}
          aria-label="Clear search"
        >
          X
        </button>
      )}
      <button type="submit" aria-label="Search">
        <IconSearch className="searchIcon" />
      </button>
    </form>
  );
}

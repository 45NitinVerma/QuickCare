import React from 'react';

export function Table({ children }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border shadow-[var(--shadow-sm)]"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
      className="text-xs uppercase font-semibold tracking-wide">
      {children}
    </thead>
  );
}

export function TableRow({ children }) {
  return (
    <tr className="transition-colors last:border-b-0 hover:bg-[var(--bg-secondary)]"
      style={{ borderBottom: '1px solid var(--border)' }}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <th className={`px-5 py-3.5 ${className}`} style={{ color: 'var(--text-muted)' }}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-5 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

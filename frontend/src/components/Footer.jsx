export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="brand"><span className="brand-mark">⌕</span> Campus<span className="brand-accent">Find</span></span>
        <span>Helping campus belongings find their way home.</span>
        <span>© {new Date().getFullYear()} CampusFind</span>
      </div>
    </footer>
  );
}

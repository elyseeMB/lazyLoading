export function Navigation() {
  const handleNavigate = (path: string) => {
    window.location.href = "/" + path;
  };

  return (
    <div>
      <h1>Navigation</h1>
      <button onClick={() => handleNavigate("faile")}>faile</button>
      <button onClick={() => handleNavigate("test")}>test</button>
    </div>
  );
}

import BootstrapClient from '@/components/BootstrapClient';
import Canvas from '@/components/Canvas';

export default function Page() {
  return (
    <>
      <BootstrapClient />
      <div className="d-flex flex-column vh-100">
        <header className="d-flex flex-row justify-content-between align-items-center p-3 flex-shrink-0">
          <h1 className="h4 mb-0">glimpsy</h1>
          <div className="d-flex flex-row gap-2">
            <button className="btn btn-sm">
              <i className="bi bi-person-circle text-light" />
            </button>
            <button className="btn btn-sm">
              <i className="bi bi-list text-light" />
            </button>
          </div>
        </header>

        <main className="flex-grow-1 position-relative">
          <Canvas />
        </main>
      </div>
    </>
  );
}
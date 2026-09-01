import ThemeConfiguration from './ThemeConfiguration';

export default function Configs() {
  return (
    <div className="flex h-full text-on-surface">
      <div className={`grow flex-col flex p-4`}>
        <div className="flex items-center justify-between h-10 mb-4">
          <h2 className="text-2xl font-bold">Configurações</h2>
        </div>

        <ThemeConfiguration />
      </div>
    </div>
  );
}

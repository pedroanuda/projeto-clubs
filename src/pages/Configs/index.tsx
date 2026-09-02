import { Divider, Icon } from 'actify';
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
      <div className="h-full hidden md:flex md:w-[60%]">
        <Divider orientation="vertical" />
        <div className="flex justify-center items-center grow select-none flex-col gap-6 opacity-60">
          <Icon style={{ '--md-icon-size': '120px' } as React.CSSProperties} fill>
            Settings
          </Icon>
          <span className="text-lg">Realize suas configurações!</span>
        </div>
      </div>
    </div>
  );
}

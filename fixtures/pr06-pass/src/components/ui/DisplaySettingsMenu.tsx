import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import {
  type ViewMode,
  useWorkspaceStore,
} from '../../features/workspace/workspaceStore';

export default function DisplaySettingsMenu() {
  const favoritesOnly = useWorkspaceStore((state) => state.favoritesOnly);
  const toggleFavoritesOnly = useWorkspaceStore((state) => state.toggleFavoritesOnly);
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const setViewMode = useWorkspaceStore((state) => state.setViewMode);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="button button--ghost" type="button">
          Display settings
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          aria-label="Display settings"
          className="display-menu"
          sideOffset={8}
        >
          <DropdownMenu.Label className="display-menu__label">
            Catalog presentation
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
          >
            <DropdownMenu.RadioItem className="display-menu__item" value="grid">
              <DropdownMenu.ItemIndicator className="display-menu__indicator">
                ●
              </DropdownMenu.ItemIndicator>
              Grid view
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem className="display-menu__item" value="compact">
              <DropdownMenu.ItemIndicator className="display-menu__indicator">
                ●
              </DropdownMenu.ItemIndicator>
              Compact view
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className="display-menu__separator" />
          <DropdownMenu.CheckboxItem
            checked={favoritesOnly}
            className="display-menu__item"
            onCheckedChange={() => toggleFavoritesOnly()}
          >
            <DropdownMenu.ItemIndicator className="display-menu__indicator">
              ✓
            </DropdownMenu.ItemIndicator>
            Show favorites only
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

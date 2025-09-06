import { MenuProviderController } from "@/controller/menuProviderController";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { TextLink } from "./textLink";

interface BackToListLinkProps {
  route: string;
  label?: string;
}

export function BackToListLink({ route, label }: BackToListLinkProps) {
  const menuMeta = MenuProviderController.getMenuMetaByRoute(route);

  if (!menuMeta) return null;

  const handleClick = () => {
    openTabSmart(
      {
        id: menuMeta.id,
        type: "route",
        label: menuMeta.label,
        route,
        icon: menuMeta.icon,
        icon_color: menuMeta.icon_color,
      },
      { replace: true }
    );
  };

  return (
    <TextLink
      icon={menuMeta.icon}
      label={label || menuMeta.label}
      onClick={handleClick}
    />
  );
}

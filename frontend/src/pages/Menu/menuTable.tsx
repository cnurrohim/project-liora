import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/Table/Table";
import { IconRenderer } from "../../components/IconRenderer";
import { EditButtonLink } from "../../components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "../../components/Buttons/DeleteButtonLink";

type MenuItem = {
  id: string;
  label: string;
  type: "route" | "command" | "group";
  icon?: string;
  route?: string;
  command?: string;
  parent_id?: string | null;
  mode?: string;
  alignment?: string;
  ordinal: number;
};

function buildMenuTree(
  items: MenuItem[]
): (MenuItem & { children?: MenuItem[] })[] {
  const itemMap = new Map<string, MenuItem & { children?: MenuItem[] }>();
  const roots: (MenuItem & { children?: MenuItem[] })[] = [];

  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = itemMap.get(item.id)!;
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.sort((a, b) => a.ordinal - b.ordinal);
}

type Props = {
  menus: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
};

export default function MenuTable({ menus, onEdit, onDelete }: Props) {
  const treeData = useMemo(() => buildMenuTree(menus), [menus]);

  const renderRowRecursive = (
    rows: (MenuItem & { children?: MenuItem[] })[],
    depth = 0
  ): React.ReactNode[] => {
    return rows.flatMap((row) => {
      const currentRow = (
        <TableRow key={row.id}>
          <TableCell>{row.ordinal}</TableCell>
          <TableCell>
            <div style={{ paddingLeft: `${depth * 20}px` }}>{row.label}</div>
          </TableCell>
          <TableCell>{row.type}</TableCell>
          <TableCell>
            {row.icon && <IconRenderer name={row.icon} size={20} />}
          </TableCell>
          <TableCell>
            {row.type === "route" ? row.route : row.command}
          </TableCell>
          <TableCell>{row.mode}</TableCell>
          <TableCell>{row.alignment}</TableCell>
          <TableCell>
            <EditButtonLink onClick={() => onEdit(row)} />
            <DeleteButtonLink onClick={() => onDelete(row.id)} />
          </TableCell>
        </TableRow>
      );

      const childrenRows = row.children?.length
        ? renderRowRecursive(
            row.children.sort((a, b) => a.ordinal - b.ordinal),
            depth + 1
          )
        : [];

      return [currentRow, ...childrenRows];
    });
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Urutan</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Alignment</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRowRecursive(treeData)}</TableBody>
      </Table>
    </div>
  );
}

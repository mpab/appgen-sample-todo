import menuData from './app.menu.json';

export interface MenuNode {
    name: string;
    children?: MenuNode[];
}

export const menuNodes: MenuNode[] = menuData;
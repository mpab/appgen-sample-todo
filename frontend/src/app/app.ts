import { afterNextRender, Component, signal, ViewChild } from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';

import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlatTreeControl } from '@angular/cdk/tree';
import { routes } from './app.routes';
import { MenuNode, menuNodes } from './app.menu';

interface FlattenedNode {
    expandable: boolean;
    name: string;
    level: number;
}

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        CommonModule,
        MatFormFieldModule,
        MatTreeModule
    ],
    templateUrl: './app.html',
    styleUrl: './app.css',
    animations: [

        trigger('triggerSideNavOpen', [
            // animations based on trigger actions
            state('open', style({ transform: 'translateX(0%)' })),
            state('close', style({ transform: 'translateX(-284px)' })),
            transition('open => close', [
                animate('300ms ease-in')
            ]),
            transition('close => open', [
                animate('300ms ease-out')
            ])
        ]),

        trigger('triggerToolbarOpen', [
            // animations based on trigger actions
            state('open', style({ transform: 'translateX(0%)', width: '97%' })),
            state('close', style({ transform: 'translateX(-284px)', width: '98%' })),
            transition('open => close', [
                animate('300ms ease-in'),
            ]),
            transition('close => open', [
                animate('300ms ease-out')
            ])
        ]),
    ]
})
export class App {
    title = 'material-responsive-sidenav';
    @ViewChild(MatSidenav)
    sidenav!: MatSidenav;
    isMobile = true;
    isMenuOpen = false;
    animationDisabled = signal(true);
    currentMenuNode = menuNodes[0];

    private _transformer = (node: MenuNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: level,
        };
    };

    treeControl = new FlatTreeControl<FlattenedNode>(
        node => node.level,
        node => node.expandable,
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    hasChild = (_: number, node: FlattenedNode) => node.expandable;

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    constructor(
        private router: Router,
        private observer: BreakpointObserver) {
        afterNextRender(() => {
            if (this.animationDisabled()) {
                this.animationDisabled.set(false);
            }
        });
        this.dataSource.data = menuNodes;
    }

    ngOnInit() {
        this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
            if (screenSize.matches) {
                this.isMobile = true;
            } else {
                this.isMobile = false;
            }
            this.onMenuNodeClick(this.currentMenuNode);
        });
    }

    toggleMenu() {
        if (this.isMobile) {
            this.sidenav.toggle();
            this.isMenuOpen = false; // On mobile, the menu can never be collapsed
        } else {
            this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
            this.isMenuOpen = !this.isMenuOpen;
        }
    }

    onMenuNodeClick(treeNode: MenuNode) {
        this.currentMenuNode = treeNode;
        let routeItem = routes.find((i) => i.path == this.currentMenuNode.name);
        if (routeItem) {
            this.router.navigate([routeItem.path]);
        }
    }
}

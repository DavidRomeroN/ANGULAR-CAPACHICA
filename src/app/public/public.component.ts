import {
  Component,
  OnInit,
  Inject,
  Renderer2,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  private _router!: Subscription;
  @ViewChild(NavbarComponent) navbar!: NavbarComponent;



  constructor(
    private renderer: Renderer2,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private element: ElementRef,
    public location: Location
  ) {}

  ngOnInit() {
    const navbarEl: HTMLElement = this.element.nativeElement.children[0]?.children[0];

    this._router = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (window.outerWidth > 991) {
          window.scrollTo(0, 0);
        } else {
          document.activeElement?.scrollTo(0, 0);
        }

        if (this.navbar) {
          this.navbar.sidebarClose();
        }
      });

    this.renderer.listen('window', 'scroll', () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      if (scrollTop > 150) {
        navbarEl?.classList.remove('navbar-transparent');
      } else {
        navbarEl?.classList.add('navbar-transparent');
      }
    });

    const ua = window.navigator.userAgent;
    const trident = ua.indexOf('Trident/');
    let version: number | null = null;

    if (trident > 0) {
      const rv = ua.indexOf('rv:');
      version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    if (version) {
      document.body.classList.add('ie-background');
    }
  }

  removeFooter(): boolean {
    const title = this.location.prepareExternalUrl(this.location.path()).slice(1);
    return !(title === 'signup' || title === 'nucleoicons');
  }


}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VisualiserComponent } from "./visualiser/visualiser.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VisualiserComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'algorithmVisualiser';
}

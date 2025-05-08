import { Routes } from "@angular/router";
import { BagComponent } from "./bag/bag.component";
import { BeautyComponent } from "./beauty/beauty.component";
import { BicycleComponent } from "./bicycle/bicycle.component";
import { BooksComponent } from "./books/books.component";
import { ChristmasComponent } from "./christmas/christmas.component";
import { DigitalDownloadComponent } from "./digital-download/digital-download.component";
import { Electronics1Component } from "./electronics/electronics-1/electronics-1.component";
import { Electronics2Component } from "./electronics/electronics-2/electronics-2.component";
import { Electronics3Component } from "./electronics/electronics-3/electronics-3.component";
import { Fashion1Component } from "./fashion/fashion-1/fashion-1.component";
import { Fashion2Component } from "./fashion/fashion-2/fashion-2.component";
import { Fashion3Component } from "./fashion/fashion-3/fashion-3.component";
import { Fashion4Component } from "./fashion/fashion-4/fashion-4.component";
import { Fashion5Component } from "./fashion/fashion-5/fashion-5.component";
import { Fashion6Component } from "./fashion/fashion-6/fashion-6.component";
import { Fashion7Component } from "./fashion/fashion-7/fashion-7.component";
import { FlowerComponent } from "./flower/flower.component";
import { FullPageComponent } from "./full-page/full-page.component";
import { Furniture1Component } from "./furniture/furniture-1/furniture-1.component";
import { Furniture2Component } from "./furniture/furniture-2/furniture-2.component";
import { FurnitureDarkComponent } from "./furniture/furniture-dark/furniture-dark.component";
import { GameComponent } from "./game/game.component";
import { GogglesComponent } from "./goggles/goggles.component";
import { GradientComponent } from "./gradient/gradient.component";
import { GymComponent } from "./gym/gym.component";
import { Jewellery1Component } from "./jewellery/jewellery-1/jewellery-1.component";
import { Jewellery2Component } from "./jewellery/jewellery-2/jewellery-2.component";
import { Jewellery3Component } from "./jewellery/jewellery-3/jewellery-3.component";
import { KidsComponent } from "./kids/kids.component";
import { MarijuanaComponent } from "./marijuana/marijuana.component";
import { Marketplace1Component } from "./marketplace/marketplace-1/marketplace-1.component";
import { Marketplace2Component } from "./marketplace/marketplace-2/marketplace-2.component";
import { Marketplace3Component } from "./marketplace/marketplace-3/marketplace-3.component";
import { Marketplace4Component } from "./marketplace/marketplace-4/marketplace-4.component";
import { MedicalComponent } from "./medical/medical.component";
import { NurseryComponent } from "./nursery/nursery.component";
import { ParallaxComponent } from "./parallax/parallax.component";
import { PerfumeComponent } from "./perfume/perfume.component";
import { PetsComponent } from "./pets/pets.component";
import { ShoesComponent } from "./shoes/shoes.component";
import { SingleProductComponent } from "./single-product/single-product.component";
import { SurfboardComponent } from "./surfboard/surfboard.component";
import { ThemeComponent } from "./theme.component";
import { ToolsComponent } from "./tools/tools.component";
import { Vegetables1Component } from "./vegetables/vegetables-1/vegetables-1.component";
import { Vegetables2Component } from "./vegetables/vegetables-2/vegetables-2.component";
import { Vegetables3Component } from "./vegetables/vegetables-3/vegetables-3.component";
import { Vegetables4Component } from "./vegetables/vegetables-4/vegetables-4.component";
import { VideoSliderComponent } from "./video-slider/video-slider.component";
import { VideoComponent } from "./video/video.component";
import { WatchComponent } from "./watch/watch.component";
import { YogaComponent } from "./yoga/yoga.component";

export const themeRoutes: Routes = [
  {
    path: '',
    component: ThemeComponent
  },
  {
    path: 'fashion_one',
    component: Fashion1Component
  },
  {
    path: 'fashion_two',
    component: Fashion2Component
  },
  {
    path: 'fashion_three',
    component: Fashion3Component
  },
  {
    path: 'fashion_four',
    component: Fashion4Component
  },
  {
    path: 'fashion_five',
    component: Fashion5Component
  },
  {
    path: 'fashion_six',
    component: Fashion6Component
  },
  {
    path: 'fashion_seven',
    component: Fashion7Component
  },
  {
    path: 'furniture_one',
    component: Furniture1Component
  },
  {
    path: 'furniture_two',
    component: Furniture2Component
  },
  {
    path: 'furniture_dark',
    component: FurnitureDarkComponent
  },
  {
    path: 'electronics_one',
    component: Electronics1Component
  },
  {
    path: 'electronics_two',
    component: Electronics2Component
  },
  {
    path: 'electronics_three',
    component: Electronics3Component
  },
  {
    path: 'marketplace_one',
    component: Marketplace1Component
  },
  {
    path: 'marketplace_two',
    component: Marketplace2Component
  },
  {
    path: 'marketplace_three',
    component: Marketplace3Component
  },
  {
    path: 'marketplace_four',
    component: Marketplace4Component
  },
  {
    path: 'vegetables_one',
    component: Vegetables1Component
  },
  {
    path: 'vegetables_two',
    component: Vegetables2Component
  },
  {
    path: 'vegetables_three',
    component: Vegetables3Component
  },
  {
    path: 'vegetables_four',
    component: Vegetables4Component
  },
  {
    path: 'jewellery_one',
    component: Jewellery1Component
  },
  {
    path: 'jewellery_two',
    component: Jewellery2Component
  },
  {
    path: 'jewellery_three',
    component: Jewellery3Component
  },
  {
    path: 'bag',
    component: BagComponent
  },
  {
    path: 'watch',
    component: WatchComponent
  },
  {
    path: 'medical',
    component: MedicalComponent
  },
  {
    path: 'perfume',
    component: PerfumeComponent
  },
  {
    path: 'yoga',
    component: YogaComponent
  },
  {
    path: 'christmas',
    component: ChristmasComponent
  },
  {
    path: 'bicycle',
    component: BicycleComponent
  },
  {
    path: 'marijuana',
    component: MarijuanaComponent
  },
  {
    path: 'gym',
    component: GymComponent
  },
  {
    path: 'tools',
    component: ToolsComponent
  },
  {
    path: 'shoes',
    component: ShoesComponent
  },
  {
    path: 'books',
    component: BooksComponent
  },
  {
    path: 'kids',
    component: KidsComponent
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: 'beauty',
    component: BeautyComponent
  },
  {
    path: 'surfboard',
    component: SurfboardComponent
  },
  {
    path: 'video_slider',
    component: VideoSliderComponent
  },
  {
    path: 'goggles',
    component: GogglesComponent
  },
  {
    path: 'flower',
    component: FlowerComponent
  },
  {
    path: 'nursery',
    component: NurseryComponent
  },
  {
    path: 'pets',
    component: PetsComponent
  },
  {
    path: 'video',
    component: VideoComponent
  },
  {
    path: 'full_page',
    component: FullPageComponent
  },
  {
    path: 'parallax',
    component: ParallaxComponent
  },
  {
    path: 'gradient',
    component: GradientComponent
  },
  {
    path: 'digital_download',
    component: DigitalDownloadComponent
  },
  {
    path: 'single_product',
    component: SingleProductComponent
  },
]

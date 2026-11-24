import { carKey, carPhoto, carUrl, priceRange, mileageText } from "@/data/cars";

export const cardOf = (car) => {
  const p = carPhoto(car);
  return {
    key: carKey(car),
    url: carUrl(car),
    full: car.full,
    name: car.name,
    brand: car.brand,
    priceText: priceRange(car),
    min: car.min,
    max: car.max,
    body: car.body,
    fuels: car.fuels,
    auto: car.auto,
    seats: car.seats,
    rating: car.rating,
    reviews: car.reviews,
    mileage: mileageText(car),
    status: car.status,
    launch: car.launch,
    photo: { src: p.src, w: p.w, h: p.h },
    popularity: car.popularity,
    ncap: car.ncap,
  };
};

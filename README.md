# CarDekho new-car catalogue scraper

Goal: get complete data of every new car on cardekho.com (name, brand, price, image, variants, colours, specs, features) from the public pages, the way a person would click a car card on `/latestcars` and open its detail page.

## How it works (verified 2026-11-16)
- Plain HTTP with `requests` is enough. No browser, no captcha, no login. A normal Chrome User-Agent is sent.
- CarDekho sends the page data as JSON inside the HTML:
  - `window.__INITIAL_STATE__ = {...}` (big JSON object) and
  - `<script type="application/ld+json">` (schema.org `Car`: name, price, bodyType, fuel, seats, airbags, colours, 930x620 pictures). Some models have no `Car` block, so the script fills the gaps from the specs and the variants.
- Pages read per car (2 requests):
  - model page `https://www.cardekho.com/<brand>/<model>` -> `overView`, `variantTable.variantList`, `galleryColorSection`, `expertReview`, `emiStart`, `orpBottomPopup.priceBreakup`
  - specs page `https://www.cardekho.com/<brand>/<model>/specs` -> `specsTechnicalJson` (`specification` = engine, dimensions...; `featured` = comfort, safety, ADAS...)
- List of all models: `https://www.cardekho.com/car-model-variant-sitemap.xml` (about 277 brand/model URLs after filtering). `--latest` uses only the 31 cars on `/latestcars`.
- A variant page (`/overview/<Model>/<Variant>.htm`) also has full specs per variant (`specsTechnicalJson`, `variantPriceDetailObject`). The script does NOT fetch variant pages yet, only the variant list with price and key specs.
- robots.txt allows these pages (it disallows search/filter/widget URLs only). Default delay 1.5 s between requests. Prices are for the site's default city (New Delhi).

## Files
- `scrape.py`: the scraper (resumable, polite delay).
- `cardekho_data/cars.jsonl`: one full JSON record per car.
- `cardekho_data/cars.csv`: summary table (written at the end of a run).
- `cardekho_data/errors.log`: failed cars.

Record fields: `slug, url, brand, model, name, status, main_image, price_range, ex_showroom_min/max, city, on_road_price_sample, body_type, fuel, transmission, seats, airbags, doors, model_year, range_km, battery, mileage, emi_per_month, colours[{name,hex,image}], pictures[], variants[{name,url,price_text,ex_showroom,on_road,fuel,key_specs,status}], description, expert_review[], specification{section:{name:value}}, features{section:{name:value}}, scraped_at`.
`null` is normal where a car does not have the thing (battery of a petrol car) or the page does not show it.

## Commands (run from `d:\Policy_Automation`)
```
python cardekho/scrape.py --latest                 # only /latestcars cars
python cardekho/scrape.py                          # every model from the sitemap (~277 cars, ~12 min)
python cardekho/scrape.py --brand tata --limit 5   # small test
python cardekho/scrape.py --images                 # also download pictures (lots of space and time)
python cardekho/scrape.py --refresh                # fetch cars again that are already saved
```
A re-run skips slugs already in `cars.jsonl`.

## State when this was written
- Tested: 6 cars (`--latest`) fine; full run started, **45 of 277 cars saved** (Aston Martin ... up to about B/C brands), then the script crashed because the `cardekho_data` folder was moved into `cardekho/` while it was running (`FileNotFoundError` on `cars.jsonl`). Not a site problem.
- The saved data is now at `cardekho/cardekho_data/cars.jsonl`, but `scrape.py` writes to `OUT = <project>/cardekho_data` (line 31). Before continuing: either move the folder back to `d:\Policy_Automation\cardekho_data`, or change `OUT` to `os.path.join(os.path.dirname(os.path.abspath(__file__)), "cardekho_data")`. Then run `python cardekho/scrape.py` again; it continues from car 46.
- Not done: cars.csv for the partial data (it is written at the end of a run), image download, per-variant pages, any data check over all 277 cars (missing-field counts), loading the data into any database or the chat API.

## Notes for the next session
- This is separate from the insurance automation (Tata AIG / Acko) in the same project.
- The data belongs to CarDekho: check their terms before using it in a product.
- If the site starts answering 403/429: raise `--delay`, do not hammer it.
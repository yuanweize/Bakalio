# Bakalio

Od zadání k jednotlivým kapitolám. V Bakaliu máš osnovu, rozepsaný text a zdroje vedle sebe.

[Vyzkoušej ukázku](https://bakalio.eurun.eu.org/demo) · [Návod pro vývojáře](README.md) · [Aktuální stav](IMPLEMENTATION_STATUS.md)

Vlož text zadání, zkontroluj dohledané požadavky a potvrď obecnou osnovu. Kapitoly se uloží jako samostatné dokumenty s historií a ochranou proti přepsání změn. Rozhraní můžeš používat česky, anglicky nebo čínsky; jazyk tvé práce se tím nemění.

Kontrola DOI porovnává metadata v Crossrefu. Neověřuje pravdivost tvrzení ani plný text. Export DOCX používá obecné rozvržení: zkontroluj požadavky školy a aktualizuj obsah ve Wordu.

Produkt se stále vyvíjí. Veřejná ukázka používá smyšlené podklady a simulovanou AI. Produkční AI, platby a veřejná registrace zatím nejsou zapnuté. Obecná osnova není návrh vytvořený AI ani šablona schválená školou.

Pro místní spuštění potřebuješ Node 24.22.1+, Docker Compose a Wasp, který nainstaluje `./scripts/setup.sh`. Potom spusť `./scripts/wasp start --client-port 4310 --server-port 4311`. Zkušební e-maily najdeš v místním Mailpitu. Podrobnosti a bezpečnostní omezení jsou v anglickém návodu.

MIT; zachováváme původní licenci Open SaaS / Wasp. Bakalio neslibuje přijetí práce, bezchybné citace ani obcházení pravidel školy.

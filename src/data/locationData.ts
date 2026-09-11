export interface District {
  name: string
}

export interface City {
  name: string
  districts: string[]
}

export interface Country {
  code: string
  name: string
  flag: string
  cities: City[]
}

export const locationHierarchy: Country[] = [
  {
    code: 'TR',
    name: 'Türkiye',
    flag: '🇹🇷',
    cities: [
      {
        name: 'İstanbul',
        districts: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Maltepe', 'Bakırköy', 'Sarıyer', 'Ataşehir', 'Beyoğlu', 'Pendik']
      },
      {
        name: 'Ankara',
        districts: ['Çankaya', 'Yenimahalle', 'Keçiören', 'Etimesgut', 'Mamak', 'Gölbaşı']
      },
      {
        name: 'İzmir',
        districts: ['Konak', 'Karşıyaka', 'Bornova', 'Alsancak', 'Urla', 'Çeşme', 'Buca']
      },
      {
        name: 'Bursa',
        districts: ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya']
      },
      {
        name: 'Antalya',
        districts: ['Muratpaşa', 'Konyaaltı', 'Kepez', 'Alanya', 'Kaş']
      }
    ]
  },
  {
    code: 'DE',
    name: 'Almanya (Germany)',
    flag: '🇩🇪',
    cities: [
      {
        name: 'Berlin',
        districts: ['Mitte', 'Kreuzberg', 'Charlottenburg', 'Friedrichshain', 'Prenzlauer Berg', 'Neukölln']
      },
      {
        name: 'Münih',
        districts: ['Schwabing', 'Maxvorstadt', 'Altstadt', 'Bogenhausen']
      },
      {
        name: 'Frankfurt',
        districts: ['Innenstadt', 'Sachsenhausen', 'Nordend', 'Westend']
      }
    ]
  },
  {
    code: 'UK',
    name: 'Birleşik Krallık (UK)',
    flag: '🇬🇧',
    cities: [
      {
        name: 'Londra',
        districts: ['Camden', 'Westminster', 'Kensington', 'Greenwich', 'Shoreditch', 'Islington']
      },
      {
        name: 'Manchester',
        districts: ['City Centre', 'Salford', 'Didsbury', 'Chorlton']
      }
    ]
  },
  {
    code: 'US',
    name: 'Amerika Birleşik Devletleri (US)',
    flag: '🇺🇸',
    cities: [
      {
        name: 'New York',
        districts: ['Manhattan', 'Brooklyn', 'Queens', 'Williamsburg', 'SoHo']
      },
      {
        name: 'San Francisco',
        districts: ['Mission District', 'SoMa', 'Marina', 'Castro', 'Nob Hill']
      }
    ]
  }
]

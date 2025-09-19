export interface WikiPage {
    wikiSlug: string;
    pageSlug: string;
    name: string;
    updated_at: string;
}

export interface LikedWiki {
    wikiSlug: string;
    name: string;
    like_count: number;
}

export interface WikiCounter {
    online: number;
    today: number;
    total: number;
    yesterday: number;
};

export interface IPAddress {
    ip: string;
    region: string;
    region_code: string;
    city: string;
    About_Us: string;
    success: boolean;
    type: string;
    continent: string;
    continent_code: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
    is_eu: boolean;
    postal: string;
    calling_code: string;
    capital: string;
    borders: string;
    flag: {
        img: string;
        emoji: string;
        emoji_unicode: string;
    };
    connection: {
        asn: number;
        org: string;
        isp: string;
        domain: string;
    };
    timezone: {
        id: string;
        abbr: string;
        is_dst: boolean;
        offset: number;
        utc: string;
        current_time: string;
    }
};
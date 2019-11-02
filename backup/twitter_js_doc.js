/**
 * @typedef {object} Tweet
 * @property {string} created_at
 * @property {int} id
 * @property {string} id_str
 * @property {string} text
 * @property {string} source
 * @property {boolean} truncated
 * @property {int} in_reply_to_status_id
 * @property {string} in_reply_to_status_id_str
 * @property {int} in_reply_to_user_id
 * @property {string} in_reply_to_user_id_str
 * @property {string} in_reply_to_screen_name
 * @property {User} user
 * @property {Coordinates} coordinates
 * @property {Places} place
 * @property {int} quoted_status_id
 * @property {string} quoted_status_id_str
 * @property {boolean} is_quote_status
 * @property {?Tweet} quoted_status
 * @property {?Tweet} retweeted_status
 * @property {int} quote_count
 * @property {int} reply_count
 * @property {int} retweet_count
 * @property {int} favorite_count
 * @property {Entity[]} entities
 * @property {ExtendedEntity[]} extended_entities
 * @property {boolean} favorited
 * @property {boolean} retweeted
 * @property {boolean} possibly_sensitive
 * @property {string} filter_level
 * @property {string} lang
 * @property {Rule[]} matching_rules
 *
 * @property {?{id_str: string}} current_user_retweet
 * @property {?object} scopes
 * @property {?boolean} withheld_copyright
 * @property {?string[]} withheld_in_countries
 * @property {?string} withheld_scope
 */
/**
 * @typedef {object} User
 * @property {int} id
 * @property {string} id_str
 * @property {string} name
 * @property {string} screen_name
 * @property {string} location
 * @property {string} url
 * @property {string} description
 * @property {Enrichment[]} derived
 * @property {boolean} protected
 * @property {boolean} verified
 * @property {int} followers_count
 * @property {int} friends_count
 * @property {int} listed_count
 * @property {int} favourites_count
 * @property {int} statuses_count
 * @property {string} created_at
 * @property {int} utc_offset
 * @property {boolean} geo_enabled
 * @property {string} lang
 * @property {boolean} contributors_enabled
 * @property {string} profile_background_color
 * @property {string} profile_background_image_url
 * @property {string} profile_background_image_url_https
 * @property {boolean} profile_background_tile
 * @property {string} profile_banner_url
 * @property {string} profile_image_url
 * @property {string} profile_image_url_https
 * @property {string} profile_link_color
 * @property {string} profile_sidebar_border_color
 * @property {string} profile_sidebar_fill_color
 * @property {string} profile_text_color
 * @property {boolean} profile_use_background_image
 * @property {boolean} default_profile
 * @property {boolean} default_profile_image
 * @property {string} withheld_in_countries
 * @property {string} withheld_scope
 */
/**
 * @typedef {object} Entity
 * @property {Hashtag[]} hashtags
 * @property {Media[]} media
 * @property {URL[]} urls
 * @property {UserMention[]} user_mentions
 * @property {Symbol[]} symbols
 * @property {Poll[]} polls
 */
/**
 * @typedef {object} ExtendedEntity
 * @property {Media[]} media
 */
/**
 * @typedef {object} Hashtag
 * @property {int[]} indices
 * @property {string} text
 */
/**
 * @typedef {object} Media
 * @property {string} display_url
 * @property {string} expanded_url
 * @property {int} id
 * @property {string} id_str
 * @property {int[]} indices
 * @property {string} media_url
 * @property {string} media_url_https
 * @property {Sizes} sizes
 * @property {int} source_status_id
 * @property {int} source_status_id_str
 * @property {"photo"|"video"|"animated_gif"} type
 * @property {string} url
 */
/**
 * @typedef {object} Sizes
 * @property {Size} thumb
 * @property {Size} large
 * @property {Size} medium
 * @property {Size} small
 */
/**
 * @typedef {object} Size
 * @property {int} w
 * @property {int} h
 * @property {"fit"|"crop"} resize
 */
/**
 * @typedef {object} URL
 * @property {string} display_url
 * @property {string} expanded_url
 * @property {int[]} indices
 * @property {string} url
 * @property {?object} unwound
 */
/**
 * @typedef {object} UserMention
 * @property {int} id
 * @property {string} id_str
 * @property {int[]} indices
 * @property {string} name
 * @property {string} screen_name
 */
/**
 * @typedef {object} Symbol
 * @property {int[]} indices
 * @property {string} text
 */
/**
 * @typedef {object} Poll
 * @property {{position: int, text: string}} options
 * @property {string} end_datetime -- "Thu May 25 22:20:27 +0000 2017"
 * @property {string} duration_minutes
 */
/**
 * @typedef {object} Places
 * @property {string} id
 * @property {string} url
 * @property {string} place_type
 * @property {string} name
 * @property {string} full_name
 * @property {string} country_code
 * @property {string} country
 * @property {Coordinates} bounding_box
 * @property {object} attributes
 */
/**
 * @typedef {{coordinates: number[][][], type: "Polygon"}|{coordinates: number[], type: "Point"}} Coordinates
 */
/**
 * @typedef {object} Rule
 * @property {string} tag
 * @property {int} id
 * @property {string} id_str
 */
/**
 * @typedef {object} Enrichment
 */
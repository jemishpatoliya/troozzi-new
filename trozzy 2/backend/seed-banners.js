const mongoose = require('mongoose');
require('dotenv').config();

const Banner = require('./src/models/banner');

const banners = [
    // Home Hero
    {
        title: "Hero 1",
        position: "home_hero",
        image: "https://serviceapi.spicezgold.com/download/1751685130717_NewProject(8).jpg",
        link: "/ProductListing",
        order: 1
    },
    {
        title: "Hero 2",
        position: "home_hero",
        image: "https://serviceapi.spicezgold.com/download/1751685144346_NewProject(11).jpg",
        link: "/ProductListing",
        order: 2
    },
    {
        title: "Hero 3",
        position: "home_hero",
        image: "https://serviceapi.spicezgold.com/download/1748955932914_NewProject(1).jpg",
        link: "/ProductListing",
        order: 3
    },
    // Home Mid Slider
    {
        title: "Mid Slider 1",
        position: "home_mid_slider",
        image: "https://serviceapi.spicezgold.com/download/1756273096312_1737036773579_sample-1.jpg",
        link: "/ProductListing",
        order: 1
    },
    {
        title: "Mid Slider 2",
        position: "home_mid_slider",
        image: "https://serviceapi.spicezgold.com/download/1742441193376_1737037654953_New_Project_45.jpg",
        link: "/ProductListing",
        order: 2
    },
    // Home Mid Banners (Side banners)
    {
        title: "Side Banner 1",
        position: "home_mid_banners",
        image: "https://serviceapi.spicezgold.com/download/1741664496923_1737020250515_New_Project_47.jpg",
        link: "/ProductListing",
        order: 1
    },
    {
        title: "Side Banner 2",
        position: "home_mid_banners",
        image: "https://serviceapi.spicezgold.com/download/1741664665391_1741497254110_New_Project_50.jpg",
        link: "/ProductListing",
        order: 2
    },
    // Home Ad Grid
    {
        title: "Ad Grid 1",
        position: "home_ad_grid",
        image: "https://img-prd-pim.poorvika.com/pageimg/Galaxy-Z-Flip-7-FE-Web-Banner-New-Mob-2025.webp",
        link: "/ProductListing",
        order: 1
    },
    {
        title: "Ad Grid 2",
        position: "home_ad_grid",
        image: "https://img.freepik.com/free-vector/soft-drink-ad_52683-9155.jpg?semt=ais_hybrid&w=740&q=80",
        link: "/ProductListing",
        order: 2
    },
    {
        title: "Ad Grid 3",
        position: "home_ad_grid",
        image: "https://img.freepik.com/free-psd/smartphone-camera-control-social-media-banner-design-template_47987-25416.jpg?semt=ais_incoming&w=740&q=80",
        link: "/ProductListing",
        order: 3
    },
    {
        title: "Ad Grid 4",
        position: "home_ad_grid",
        image: "https://d3jmn01ri1fzgl.cloudfront.net/photoadking/webp_thumbnail/tulip-tree-and-buddha-gold-fashion-banner-template-nr6gkr38da1f46.webp",
        link: "/ProductListing",
        order: 4
    },
    // Home Promo Slider (Bottom slider)
    {
        title: "Promo 1",
        position: "home_promo_slider",
        image: "https://static.vecteezy.com/system/resources/thumbnails/004/604/634/small/online-shopping-on-website-and-mobile-application-by-smart-phone-digital-marketing-shop-and-store-concept-vector.jpg",
        link: "/ProductListing",
        order: 1
    },
    {
        title: "Promo 2",
        position: "home_promo_slider",
        image: "https://static.vecteezy.com/system/resources/thumbnails/004/604/634/small/online-shopping-on-website-and-mobile-application-by-smart-phone-digital-marketing-shop-and-store-concept-vector.jpg",
        link: "/ProductListing",
        order: 2
    },
    {
        title: "Promo 3",
        position: "home_promo_slider",
        image: "https://static.vecteezy.com/system/resources/thumbnails/004/299/835/small/online-shopping-on-phone-buy-sell-business-digital-web-banner-application-money-advertising-payment-ecommerce-free-vector.jpg",
        link: "/ProductListing",
        order: 3
    },
    {
        title: "Promo 4",
        position: "home_promo_slider",
        image: "https://static.vecteezy.com/system/resources/thumbnails/004/299/835/small/online-shopping-on-phone-buy-sell-business-digital-web-banner-application-money-advertising-payment-ecommerce-free-vector.jpg",
        link: "/ProductListing",
        order: 4
    }
];

async function seedBanners() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing banners to refresh with all types
        await Banner.deleteMany({});
        console.log('Deleted existing banners');

        await Banner.insertMany(banners);
        console.log('Seeded all types of banners successfully');
    } catch (error) {
        console.error('Error seeding banners:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedBanners();

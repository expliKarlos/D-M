export type GuideItem = {
    id: string;
    image: string;
};

export type GuideCategory = {
    id: string;
    labelKey: string;
    items: GuideItem[];
};

export const INDIA_GUIDE_DATA: GuideCategory[] = [
    {
        id: 'documentation',
        labelKey: 'guide.tabs.documentation',
        items: [
            { id: 'visa', image: '/InfoIndia/InfoDocu1.png' },
            { id: 'passport', image: '/InfoIndia/InfoDocu2.png' },
            { id: 'backup', image: '/InfoIndia/InfoDocu3.png' }
        ]
    },
    {
        id: 'health',
        labelKey: 'guide.tabs.health',
        items: [
            { id: 'vaccines', image: '/InfoIndia/InfoSalud1.png' },
            { id: 'water', image: '/InfoIndia/InfoSalud2.png' },
            { id: 'kit_diarrhea', image: '/InfoIndia/InfoSalud3.png' },
            { id: 'kit_serum', image: '/InfoIndia/InfoSalud4.png' },
            { id: 'kit_repellent', image: '/InfoIndia/InfoSalud5.png' },
            { id: 'kit_disinfectant', image: '/InfoIndia/InfoSalud6.png' },
            { id: 'tips_oil', image: '/InfoIndia/InfoSalud7.png' },
            { id: 'tips_monkeys', image: '/InfoIndia/InfoSalud8.png' },
            { id: 'toilets', image: '/InfoIndia/InfoSalud9.png' },
            { id: 'protection', image: '/InfoIndia/InfoSalud10.png' }
        ]
    },
    {
        id: 'transport',
        labelKey: 'guide.tabs.transport',
        items: [
            { id: 'planning', image: '/InfoIndia/InfoTransp1.png' },
            { id: 'driving', image: '/InfoIndia/InfoTransp2.png' },
            { id: 'apps', image: '/InfoIndia/InfoTransp3.png' },
            { id: 'trains', image: '/InfoIndia/InfoTransp4.png' },
            { id: 'driver', image: '/InfoIndia/InfoTransp5.png' },
            { id: 'airport', image: '/InfoIndia/InfoTransp6.png' },
            { id: 'tuktuk', image: '/InfoIndia/InfoTransp7.png' }
        ]
    },
    {
        id: 'insurance',
        labelKey: 'guide.tabs.insurance',
        items: [
            { id: 'medical', image: '/InfoIndia/InfoSeguro1.png' },
            { id: 'repatriation', image: '/InfoIndia/InfoSeguro2.png' },
            { id: 'luggage', image: '/InfoIndia/InfoSeguro3.png' },
            { id: 'cancellation', image: '/InfoIndia/InfoSeguro4.png' },
            { id: 'liability', image: '/InfoIndia/InfoSeguro5.png' }
        ]
    },
    {
        id: 'money',
        labelKey: 'guide.tabs.money',
        items: [
            { id: 'payment', image: '/InfoIndia/Infodin1.png' },
            { id: 'bargaining', image: '/InfoIndia/Infodin2.png' },
            { id: 'gem_scam', image: '/InfoIndia/Infodin3.png' },
            { id: 'fake_guides', image: '/InfoIndia/Infodin4.png' },
            { id: 'fake_inspectors', image: '/InfoIndia/Infodin5.png' }
        ]
    },
    {
        id: 'culture',
        labelKey: 'guide.tabs.culture',
        items: [
            { id: 'namaste', image: '/InfoIndia/InfoCult1.png' },
            { id: 'right_hand', image: '/InfoIndia/InfoCult2.png' },
            { id: 'staring', image: '/InfoIndia/InfoCult3.png' },
            { id: 'dress_code', image: '/InfoIndia/InfoCult4.png' },
            { id: 'barefoot', image: '/InfoIndia/InfoCult5.png' },
            { id: 'cremations', image: '/InfoIndia/InfoCult6.png' }
        ]
    },
    {
        id: 'connectivity',
        labelKey: 'guide.tabs.connectivity',
        items: [
            { id: 'esim', image: '/InfoIndia/InfoCon1.png' },
            { id: 'config', image: '/InfoIndia/InfoCon2.png' },
            { id: 'sim', image: '/InfoIndia/InfoCon3.png' },
            { id: 'apps', image: '/InfoIndia/InfoCon4.png' }
        ]
    },
    {
        id: 'attitude',
        labelKey: 'guide.tabs.attitude',
        items: [
            { id: 'patience', image: '/InfoIndia/InfoAct1.png' },
            { id: 'anger', image: '/InfoIndia/InfoAct2.png' },
            { id: 'adaptation', image: '/InfoIndia/InfoAct3.png' },
            { id: 'prejudice', image: '/InfoIndia/InfoAct4.png' }
        ]
    },
    {
        id: 'luggage',
        labelKey: 'guide.tabs.luggage',
        items: [
            { id: 'backpack', image: '/InfoIndia/InfoEqui1.png' },
            { id: 'earplugs', image: '/InfoIndia/InfoEqui2.png' },
            { id: 'sarong', image: '/InfoIndia/InfoEqui3.png' },
            { id: 'adapter', image: '/InfoIndia/InfoEqui4.png' },
            { id: 'socks', image: '/InfoIndia/InfoEqui5.png' }
        ]
    },
    {
        id: 'women',
        labelKey: 'guide.tabs.women',
        items: [
            { id: 'ring', image: '/InfoIndia/InfoXica2.png' },
            { id: 'crowds', image: '/InfoIndia/InfoXica3.png' },
            { id: 'eye_contact', image: '/InfoIndia/InfoXica4.png' }
        ]
    }
];

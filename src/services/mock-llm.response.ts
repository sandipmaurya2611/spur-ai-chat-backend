import { logger } from '../utils/logger';

// Granular intents for better precision
type Intent =
    | 'greeting'
    | 'shipping_location'   // "Do you ship to X?"
    | 'shipping_policy'     // General shipping questions
    | 'shipping_clarification' // NEW: For ambiguous "shipping?"
    | 'delivery_time'       // "How long?"
    | 'tracking_status'     // "Where is my order?"
    | 'returns_policy'
    | 'process_inquiry'
    | 'support_contact'
    | 'order_cancellation'
    | 'out_of_scope'
    | 'fallback';

export function detectIntent(message: string, previousIntent?: Intent): Intent {
    // 1. Normalize Input
    const text = message.toLowerCase().trim().replace(/[^\w\s]/g, ''); // Remove punctuation
    const words = text.split(/\s+/);
    const wordCount = words.length;

    // 2. Out of Scope (Highest Priority - Fail Fast)
    if (text.match(/\b(discount|coupon|promo|code|price|cost|competitor|cheap|deal|sale)\b/)) return 'out_of_scope';

    // 3. Greeting (High Priority)
    if (text.match(/\b(hi+|hello|hey+|hlo|greetings|namaste|good morning|good afternoon|good evening)\b/)) return 'greeting';

    // 4. Tracking (Highest Priority Service Query)
    if (text.match(/\b(track|tracking number)\b/)) return 'tracking_status';
    if (text.match(/\b(where)\b.*(order|package|shipping|shipment|item|stuff)\b/)) return 'tracking_status';
    if (text.match(/\b(status)\b.*(order|shipping|shipment)\b/)) return 'tracking_status';

    if (wordCount <= 2 && text.match(/\b(shipping|delivery|ship|deliver)\b/) && !previousIntent) {
        return 'shipping_clarification';
    }

    // 5.5. Order Cancellation
    if (text.match(/\b(cancel|cancel order|cancel my order|cancel product|cancel my product|stop my order|i want to cancel)\b/)) return 'order_cancellation';

    // 6. Delivery Time
    if (text.match(/\b(how long|when)\b.*(arrive|get|take|deliver|receive|reach)\b/)) return 'delivery_time';
    if (text.match(/\b(delivery time|shipping time|duration)\b/)) return 'delivery_time';

    // 7. Shipping Location / Policy
    if (text.match(/\b(international|worldwide|globally|overseas|outside country|ship to|deliver to|send to)\b/)) return 'shipping_location';
    if (text.match(/\b(ship|deliver|send)\b.*(to|in|at)\b/)) return 'shipping_location';
    if (text.match(/\b(shipping|delivery)\b/)) {
        // Disambiguation
        if (text.match(/\b(time|long)\b/)) return 'delivery_time';
        if (text.match(/\b(track|where|status)\b/)) return 'tracking_status';
        return 'shipping_policy';
    }

    // 8. Returns
    if (text.match(/\b(return|refund|exchange|back)\b/)) return 'returns_policy';

    // 9. Process
    if (text.match(/\b(process|how to|steps|procedure|do i need to)\b/)) return 'process_inquiry';

    // 10. Support
    if (text.match(/\b(support|contact|email|phone|help|human|agent)\b/)) return 'support_contact';

    // 11. Context Inference
    if (previousIntent) {
        if (['shipping_location', 'shipping_policy', 'tracking_status'].includes(previousIntent)) {
            if (text.match(/\b(long|time|days|when|arrive)\b/)) return 'delivery_time';
        }
        if (['tracking_status'].includes(previousIntent)) {
            if (text.match(/\b(where|status|it)\b/)) return 'tracking_status';
        }
    }

    // 12. Fallback
    return 'fallback';
}

export function getMockResponse(message: string, previousIntent?: Intent): { text: string, intent: Intent } {
    // 0. Empty Input Validation (Redundant safety check, logic primarily in Service)
    if (!message || !message.trim()) {
        return {
            text: "Please enter a message so I can help you.",
            intent: 'fallback'
        };
    }

    let intent = detectIntent(message, previousIntent);
    let carryOverApplied = false;

    // 1. Contextual Carry-over Logic (Senior-grade logic for short follow-ups)
    if (message.length < 20 && previousIntent && intent === 'fallback') {
        const text = message.toLowerCase();
        // If message contains soft keywords related to commerce, carry over the intent
        if (text.match(/\b(shipping|delivery|order|cancel|product|item|return|refund|track|status|it|that|how|when|where|international|worldwide|globally|overseas)\b/)) {
            intent = previousIntent;
            carryOverApplied = true;
        }
    }

    logger.info('Mock LLM intent detected', {
        intent,
        message,
        previousIntent,
        carryOverApplied
    });

    const responses: Record<Intent, string[]> = {
        greeting: [
            "Hello! How can I help you today?",
            "Hi there! I'm here to help with shipping, returns, and order questions.",
            "Greetings! How may I assist you with your store inquiries?"
        ],
        shipping_clarification: [
            "Are you asking about delivery time, tracking, or shipping locations?"
        ],
        shipping_location: [
            "Yes, we ship to that location. Standard delivery takes 5–7 business days.",
            "We certainly ship there. You can expect your order in 5–7 business days via our standard shipping.",
            "Yes, our worldwide shipping covers your region. Delivery typically takes 5–7 business days."
        ],
        shipping_policy: [
            "We ship worldwide using standard shipping. Do you need delivery times or tracking details?",
            "Yes, we offer worldwide shipping. Standard delivery is 5–7 business days.",
            "Our shipping services cover most global destinations with a 5–7 day delivery window."
        ],
        delivery_time: [
            "Standard delivery typically takes 5–7 business days.",
            "You can expect your order to arrive within 5–7 business days.",
            "Orders are usually delivered in 5 to 7 business days."
        ],
        tracking_status: [
            "Once your order ships, we email tracking details so you can check its status.",
            "You will receive an automated email with tracking details as soon as your package leaves our warehouse.",
            "Tracking information is sent via email immediately upon shipment."
        ],
        returns_policy: [
            "We have a 7-day return policy for unused items. Refunds are processed in 5–7 business days.",
            "You can return items within 7 days if they are unused. We process verified refunds within 5–7 business days.",
            "Our policy allows returns within 7 days of delivery for new, unused items."
        ],
        process_inquiry: [
            "To place a return, simply contact support. For shipping, we handle everything automatically once you order.",
            "The process is simple: orders ship in 5-7 days, and returns are accepted within 7 days of delivery."
        ],
        support_contact: [
            "Our support team is online Mon-Fri, 10am–6pm IST. You can reach us via email during those hours.",
            "You can contact human support between 10am and 6pm IST, Monday through Friday."
        ],
        order_cancellation: [
            "You can cancel your order before it has been shipped. Please contact our support team with your order ID to request cancellation."
        ],
        out_of_scope: [
            "I apologize, but I can only assist with questions regarding shipping, returns, and store policies.",
            "I don't have information about discounts. I can only help with store policies.",
            "My expertise is limited to shipping, returns, and general support inquiries."
        ],
        fallback: [
            "I can help with shipping, returns, or support hours. Could you tell me a bit more?",
            "I'm not sure I understood. Are you asking about an order or our policies?"
        ]
    };

    const possibleResponses = responses[intent];
    const text = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

    return { text, intent };
}

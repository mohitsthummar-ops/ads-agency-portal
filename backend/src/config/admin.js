/**
 * Configuration for application administrators.
 * ONLY these emails will be granted the 'admin' role.
 */
const ADMIN_EMAILS = [
    'nikonlinemarket@gmail.com',
    'kaushalpthummar@gmal.com'
];

module.exports = {
    ADMIN_EMAILS: ADMIN_EMAILS.map(email => email.toLowerCase().trim())
};

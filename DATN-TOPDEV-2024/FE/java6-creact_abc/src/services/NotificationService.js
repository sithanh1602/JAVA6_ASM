import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/notifications';

const NotificationService = {
    /**
     * Fetch notifications for a specific user
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} - Array of notifications
     */
    getUserNotifications: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw error;
        }
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - The ID of the notification
     * @returns {Promise<Object>} - Updated notification
     */
    markAsRead: async (notificationId) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Filter recent notifications (within 7 days)
     * @param {Array} notifications - Array of notification objects
     * @returns {Array} - Filtered notifications with timeLeft property
     */
    filterRecentNotifications: (notifications) => {
        const now = new Date();
        return notifications.map(notification => {
            const createdAt = new Date(notification.createdAt);
            const expirationDate = new Date(createdAt);
            expirationDate.setDate(createdAt.getDate() + 7);
            const timeLeft = Math.max(0, expirationDate - now);
            return { ...notification, timeLeft };
        }).filter(notification => notification.timeLeft > 0);
    }
};

export default NotificationService;
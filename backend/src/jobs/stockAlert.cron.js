const cron = require('node-cron')
const { getLowStockIngredients } = require('../services/ingredient.service')
const { sendEmail } = require('../utils/sendEmail')

const stockAlertJob = () => {
    // Runs every day at 8:00 AM
    // Cron syntax: minute hour day month weekday
    cron.schedule('0 8 * * *', async () => {
        console.log('Running stock alert check...')

        try {
            const lowStockItems = await getLowStockIngredients()

            if (lowStockItems.length === 0) return

            const itemList = lowStockItems
                .map(item => `<li>${item.name} (${item.type}) — ${item.quantity} ${item.unit} remaining</li>`)
                .join('')

            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: '⚠️ Low Stock Alert — Pizza App',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Low Stock Alert</h2>
            <p>The following ingredients are running low and need restocking:</p>
            <ul>${itemList}</ul>
            <p>Please update the inventory from your admin dashboard.</p>
          </div>
        `,
            })

            console.log(`Stock alert sent for ${lowStockItems.length} items`)
        } catch (err) {
            console.error('Stock alert cron error:', err)
        }
    })
}

module.exports = stockAlertJob
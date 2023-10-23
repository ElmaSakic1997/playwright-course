import { expect } from "playwright/test"

export class PaymentPage {
    constructor(page) {
        this.page = page

        this.discountCode = page.frameLocator('[data-qa="active-discount-container"]').locator('[data-qa="discount-code"]')
        // new element for the discount input 
        this.discountInput = page.getByPlaceholder('Discount code')
        this.activateDiscountButton = page.locator('[data-qa="submit-discount-button"]')
        this.totalValue = page.locator('[data-qa="total-value"]')
        this.discountedValue = page.locator('[data-qa="total-with-discount-value"]')
        this.discountActiveMessage = page.locator('[data-qa="discount-active-message"]')
        this.CreditCardOwnerInput = page.locator('[data-qa="credit-card-owner"]')
        this.CreditCardNumberInput = page.locator('[data-qa="credit-card-number"]')
        this.ValidUntilInput = page.locator('[data-qa="valid-until"]')
        this.CreditCardCvcInput = page.locator('[data-qa="credit-card-cvc"]')
        this.payButton = page.locator('[data-qa="pay-button"]')
    }

    activateDiscount = async () => {
        await this.discountCode.waitFor()
        const code = await this.discountCode.innerText()
        await this.discountInput.waitFor()

        // Option 1 for laggy inputs: using .fill() with await expect
        await this.discountInput.fill(code)
        await expect(this.discountInput).toHaveValue(code)

        // Option 2 for laggy inputs: slow typing
        // await this.discountInput.focus()
        // await this.page.keyboard.type(code, {delay: 1000})
        // expect(await this.discountInput.inputValue()).toBe(code)

        expect(await this.discountedValue.isVisible()).toBe(false) // true or false
        expect(await this.discountActiveMessage.isVisible()).toBe(false)
        await this.activateDiscountButton.waitFor()
        await this.activateDiscountButton.click()

        // check that it displays "Discount activated"
        await this.discountActiveMessage.waitFor()
        // check that there is now a discounted price total showing
        await this.discountedValue.waitFor()
        // check that the discounted price total is smaller than the regular one
        const discountValueText = await this.discountedValue.innerText()
        const discountValueOnlyStringNumber = discountValueText.replace("$", "")
        const discountValueNumber = parseInt(discountValueOnlyStringNumber, 10)
        await this.totalValue.waitFor()
        const totalValueText = await this.totalValue.innerText()
        const totalValueOnlyStringNumber = totalValueText.replace("$", "")
        const totalValueNumber = parseInt(totalValueOnlyStringNumber, 10)
        expect(discountValueNumber).toBeLessThan(totalValueNumber)
    }

    fillPaymentDetails = async (paymentDetails) => {
        await this.CreditCardOwnerInput.waitFor()
        await this.CreditCardOwnerInput.fill(paymentDetails.owner)
        await this.CreditCardNumberInput.waitFor()
        await this.CreditCardNumberInput.fill(paymentDetails.number)
        await this.ValidUntilInput.waitFor()
        await this.ValidUntilInput.fill(paymentDetails.validUntil)
        await this.CreditCardCvcInput.waitFor()
        await this.CreditCardCvcInput.fill(paymentDetails.cvc)
    }

    completePayment = async () => {
        await this.payButton.waitFor()
        await this.payButton.click()
        await this.page.waitForURL(/\/thank-you/, { timeout: 3000 })
    }

}
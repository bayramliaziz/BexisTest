import Browser from '../../util/Browser';
import util from '../../util/common';
import { assert } from 'chai';
import elements from '../../util/common/elements';

describe('Create Booking', () => {

  it('should create a booking', async () => {

    const page = await Browser.openTab();

    // make sure we are logged in
    if (!(await util.login.isLoggedIn(page))) {
      await assert.isFulfilled(util.login.loginUser(page), 'should login');
    }

    // navigate to "Calendar"
    await assert.isFulfilled(util.menu.select(page, 'Calendar'), 'should navigate to calendar page');

    // wait for Book Resource button is loaded in view model
    await assert.isFulfilled(page.waitForSelector('#Content_Filter > a', { visible: true }), 'should wait for book resource button');

    // click Book Resource button
    await Promise.all([
      page.waitForNavigation(),
      page.click('#Content_Filter > a'),
    ]);

    // wait for the first Select Resource button is loaded in view model
    await assert.isFulfilled(page.waitForSelector('#Grid_Resource > table > tbody > tr:nth-child(1) > td:nth-child(3) > span', {visible: true}), 'should wait for select resource button');

    // get a random Resource
    const resourceSelect = await page.$$('span[title="Select resource"]');
    const randomResourceSelector= Math.floor(Math.random() * resourceSelect.length);

    // click a random Resource
    await assert.isFulfilled(page.click(`#Grid_Resource > table > tbody > tr:nth-child(${randomResourceSelector}) > td:nth-child(3) > span`), 'should click a random resource');

    // wait for Continue Booking button is loaded in view model
    await assert.isFulfilled(page.waitForSelector('#ResourceCart > a', {visible:true}), 'should wait for continue booking button');

    // click Continue Booking button
    await Promise.all([
      page.waitForNavigation(),
      page.click('#ResourceCart > a'),
    ]);

    // wait for Open Calendar icon is loaded in view model
    await assert.isFulfilled(page.waitForSelector('#timePeriod_1 > tr:nth-child(1) > td:nth-child(2) > div > div > span > span', {visible:true}), 'should wait for calendar icon');

    // click Calendar icon for a start date
    await assert.isFulfilled(page.click('#timePeriod_1 > tr:nth-child(1) > td:nth-child(2) > div > div > span > span'), 'should click calendar icon for a start date');

    // wait for Calendar to be loaded in view model
    await assert.isFulfilled(page.waitForSelector('body > div.t-animation-container', {visible:true}), 'should wait for calendar');

    // screenshot the visible calendar
    await page.screenshot({path:'calendarVisibleStart.png'});

    // click a random day on current month for a start date
    const startDays = await page.$$('body > div.t-animation-container > div > table > tbody > tr > td:not(.t-other-month)');

    // startDays.length - 2 --> it is for a gap between start and end date
    const randomStartDays = Math.floor(Math.random() * (startDays.length - 2));
    startDays[randomStartDays].click();

    // wait for Calendar to be hidden in view model
    await assert.isFulfilled(page.waitForSelector('body > div.t-animation-container', {visible:false}), 'should wait for calendar to be hidden');

    // screenshot the calendar start date
    await page.screenshot({path:'calendarStartDate.png'});

    // click Calendar icon for an end date
    await assert.isFulfilled(page.click('#timePeriod_1 > tr:nth-child(2) > td:nth-child(2) > div > div > span > span'), 'should click calendar icon for an end date');

    // wait for Calendar is loaded in view model
    await assert.isFulfilled(page.waitForSelector('body > div.t-animation-container', {visible:true}), 'should wait for calendar');

    // screenshot the visible calendar
    await page.screenshot({path:'calendarVisibleEnd.png'});

    // click a random day on current month for an end date
    const endDays = await page.$$('body > div.t-animation-container > div > table > tbody > tr > td:not(.t-other-month)');

    // remove days until the start date for not picking a past date
    const splicedEndDays = endDays.splice(randomStartDays);
    splicedEndDays[Math.floor(Math.random() * splicedEndDays.length)].click();

    //  wait for Calendar to be hidden in view model
    await assert.isFulfilled(page.waitForSelector('body > div.t-animation-container', {visible:false}), 'should wait for calendar to be hidden');

    // screenshot the calendar an end date
    await page.screenshot({path:'calendarEndDate.png'});

    // add Reason to the booking
    const reasonSelector = '.fa-plus';
    if (await page.$(reasonSelector) !== null) {

      // click add reason button
      await assert.isFulfilled(page.click('.fa-plus'), 'should click add reason button');

      // wait for Select Activities window is loaded in view model
      await assert.isFulfilled(page.waitForSelector('#Window_ChooseActivities', {visible:true}), 'should wait for select activities window');

      // click a random checkbox for Select column
      const selectCheckbox = await page.$$('input[type="checkbox"]');
      const randomCheckbox = Math.floor(Math.random() * selectCheckbox.length);
      selectCheckbox[randomCheckbox].click();

      // click Add activities to schedule
      await assert.isFulfilled(page.click('#Content_ChooseActivities > div > div.bx-rpm-submit.bx-rpm-buttons > button'), 'should click add activities button to schedule');

      // wait for Select Activities window is not found in view model
      await assert.isFulfilled(page.waitForSelector('#Window_ChooseActivities', {hidden:true}), 'should wait for select activities window to be hidden');
    }

    // find Name field
    await assert.isFulfilled(page.type('#Name', 'booking.test.name'), 'should enter a name');

    // find Description field
    await assert.isFulfilled(page.type('#Description', 'booking.test.desc'), 'should enter a description');

    // click Book button
    await Promise.all([
      page.waitForNavigation(),
      page.click('#Content_Event > div.bx-footer.right > a:nth-child(2)'),
    ]);

    // wait for Calendar to appear
    await assert.isFulfilled( page.waitForSelector( '#calendar .fc-event' ), 'should wait until the calendar including the event' );

    // wait that the controls are active
    await assert.isFulfilled( page.waitForSelector( '#displayView.ready' ), 'should wait until the controls are active' );

    // click List button
    const listSwitch = await page.evaluateHandle( () => document.querySelector( '#displayView input[value="List"]' ).parentNode );
    await assert.isFulfilled( listSwitch.asElement().click() );

    // wait for Resource Table Filter is loaded in view model
    await assert.isFulfilled(page.waitForSelector('#scheduleList #resources_table > tbody > tr', {visible:true}), 'should wait for resource table filter');

    // check for an entry by Description Name in the list of bookings
    const checkEntry = await elements.hasEntry(page, '#resources_table > tbody > tr', 'booking.test.desc', '2');
    assert.isTrue(checkEntry, 'should contain the new booking in the table');
  });
});
var assert = require('assert');
var Timer = require('../src/timer.js')
var sinon = require('sinon');

describe('timer.js', function(){
    var timer,
        clock;

    function assertTimes(timer, timesValues, totalTimesValues) {
        var times = timer.getTimeValues();
        var totalTimes = timer.getTotalTimeValues();

        assert.deepEqual(times.seconds, timesValues[0]);
        assert.deepEqual(times.minutes, timesValues[1]);
        assert.deepEqual(times.hours, timesValues[2]);

        assert.deepEqual(totalTimes.seconds, totalTimesValues[0]);
        assert.deepEqual(totalTimes.minutes, totalTimesValues[1]);
        assert.deepEqual(totalTimes.hours, totalTimesValues[2]);
    }

    function assertEventTriggered(timer, event, millisecons, timesTriggered) {
        var callback = sinon.spy();
        timer.addEventListener(event, callback);
        clock.tick(millisecons);
        sinon.assert.callCount(callback, timesTriggered);
    }

    beforeEach(function () {
        timer = new Timer();
    });

    afterEach(function () {
        timer.stop();
    });

    describe('new Timer()', function () {
        it('should return a timer instance', function () {
            assert.equal(typeof timer, 'object');
            assert.equal(typeof timer.start, 'function');
        });
    });

    describe('Timer instance', function () {
        describe('default values', function () {
            it('should have counters with 0 values', function () {
                assertTimes(timer, [0, 0, 0], [0, 0, 0]);
            });
        });

        describe('start function', function () {
            var startedListener;
            beforeEach(function () {
                startedListener = sinon.spy();
                timer.addEventListener('started', startedListener);
                timer.start();
            });

            it('should start the timer', function () {
                assert.equal(timer.isRunning(), true);
            });

            it('should trigger started event', function () {
                sinon.assert.callCount(startedListener, 1);
            });

            it('should raise and Exception if is already running', function () {
                assert.throws(function () {
                    timer.start();
                }, /Timer already running/);
            });

            describe('with default params', function () {
                it('should have seconds precision', function () {
                    assert.equal(timer.getConfig().precision, 'seconds');
                });

                it('should not be countdown timer', function () {
                    assert.equal(timer.getConfig().countdown, false);
                });

                it('should have default callback empty function', function () {
                    assert.equal(typeof timer.getConfig().callback, 'function');
                })
            });
        });

        describe('started', function () {
            describe('regular timer', function () {
                describe('with seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'seconds', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [1, 0, 0], [1, 0, 0]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 1, 0], [60, 1, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 1], [3600, 60, 1]);
                    });

                    it('should execute callback every second', function () {
                        clock.tick(1000);
                        assert(params.callback.called);
                    });
                });

                describe('with minutes precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'minutes', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update minute every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 1, 0], [60, 1, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 1], [3600, 60, 1]);
                    });

                    it('should execute callback every 60 seconds', function () {
                        clock.tick(60000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });

                describe('with hours precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'hours', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 1], [3600, 60, 1]);
                    });

                    it('should execute callback every 3600 seconds', function () {
                        clock.tick(3600000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });
            });

            describe('countdown timer', function () {
                describe('with seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'seconds', callback: sinon.spy(), startValues: {seconds: 7199 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [58, 59, 1], [7198, 119, 1]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [59, 58, 1], [7139, 118, 1]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [59, 59, 0], [3599, 59, 0]);
                    });

                    it('should execute callback every second', function () {
                        clock.tick(1000);
                        assert(params.callback.called);
                    });
                });

                describe('with minutes precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'minutes', callback: sinon.spy(), startValues: {seconds: 7199 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [59, 58, 1], [7139, 118, 1]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [59, 59, 0], [3599, 59, 0]);
                    });

                    it('should execute callback every 60 seconds', function () {
                        clock.tick(60000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });

                describe('with hours precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'hours', callback: sinon.spy(), startValues: {seconds: 7199 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [59, 59, 0], [3599, 59, 0]);
                    });

                    it('should execute callback every 3600 seconds', function () {
                        clock.tick(3600000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });
            });
        });

        describe('with time target', function () {
            describe('setting target params', function () {
                var target,
                    configTarget;
                describe('with object input', function () {
                    var emptyObjectTarget;
                    beforeEach(function() {
                        target = {seconds: 10, minutes: 50, hours: 15};
                        emptyObjectTarget = {};

                    });

                    it('should transform object into array', function () {
                        timer.start({target: target});
                        configTarget = timer.getConfig().target;
                        assert(configTarget instanceof Array && configTarget.length === 3);
                    });

                    it('should transform into 0 values array if the object is empty', function () {
                        timer.start({target: emptyObjectTarget});
                        configTarget = timer.getConfig().target;
                        assert.equal(configTarget[0], 0);
                        assert.equal(configTarget[1], 0);
                        assert.equal(configTarget[2], 0);
                    });

                    it('should set seconds in first position, minutes in second position and hours in third position', function () {
                        timer.start({target: target});
                        configTarget = timer.getConfig().target;
                        assert.equal(configTarget[0], target.seconds);
                        assert.equal(configTarget[1], target.minutes);
                        assert.equal(configTarget[2], target.hours);
                    });
                });

                describe('with array input', function () {
                    it('should throw exception if the size is incorrect', function () {
                        var target = [];
                        assert.throws(function () {
                            timer.start({target: target});
                        }, /Array size not valid/);
                    });
                });

                it('should add minutes every 60 seconds', function () {
                    target = [90, 0, 0];
                    timer.start({target: target});
                    configTarget = timer.getConfig().target;

                    assert.deepEqual(timer.getConfig().target, [30, 1, 0]);
                });

                it('should add hours every 60 minutes', function () {
                    target = [0, 95, 0];
                    timer.start({target: target});
                    configTarget = timer.getConfig().target;

                    assert.deepEqual(timer.getConfig().target, [0, 35, 1]);
                });

                it('should not start if start values and target are equal', function () {
                    target = [0, 95, 0];
                    startValues = [0, 95, 0];
                    timer.start({target: target, startValues: startValues});
                    assert(!timer.isRunning());
                });

                describe('with regular timer', function () {
                    beforeEach(function () {
                        clock = sinon.useFakeTimers();
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should stop when hours counter > hour target', function () {
                        target = [1, 0, 0];
                        timer.start({target: target, precision: 'hours'});
                        assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter > minutes target', function () {
                        target = [5, 5, 0];
                        timer.start({target: target, precision: 'minutes'});
                        assertEventTriggered(timer, 'targetAchieved', 360000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter >= seconds target', function () {
                        target = [5, 5, 0];
                        timer.start({target: target, precision: 'seconds'});
                        assertEventTriggered(timer, 'targetAchieved', 305000, 1);
                        assert(!timer.isRunning());
                    });
                });

                describe('with countdown timer', function () {
                    var startValues;

                    beforeEach(function () {
                        clock = sinon.useFakeTimers();
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should stop when hours counter < hour target', function () {
                        startValues = [0, 30, 1]
                        target = [0, 0, 1];
                        timer.start({target: target, startValues: startValues, precision: 'hours', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter < minutes target', function () {
                        startValues = [0, 30, 0];
                        target = [0, 29, 0];
                        timer.start({target: target, startValues: startValues, precision: 'minutes', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 60000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter <= seconds target', function () {
                        startValues = [30, 0, 0];
                        target = [29, 0, 0];
                        timer.start({target: target, startValues: startValues, precision: 'seconds', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 1000, 1);
                        assert(!timer.isRunning());
                    });
                });
            });
        });

        describe('stop function', function () {
            it('should stop the timer', function () {
                timer.start();
                timer.stop();
                assert.equal(timer.isRunning(), false);
            });
        });
    });
});

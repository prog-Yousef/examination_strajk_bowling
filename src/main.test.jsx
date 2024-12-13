
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import App from './App';
import Booking from './views/Booking';
import Confirmation from './views/Confirmation';
 import { server } from './__mocks__/server';
 
import './setupTest';




// Utility function to fill out booking form
const fillBookingForm = async (options = {}) => {
    const {
        time = '11:00', 
        date = '2024-12-13', 
        players = '2', 
        lanes = '1',
        shoes = 2
    } = options;

    await userEvent.type(screen.getByText('Time').parentElement.children[1], time);
    await userEvent.type(screen.getByText('Date').parentElement.children[1], date);
    await userEvent.type(screen.getByText('Number of awesome bowlers').parentElement.children[1], players);
    await userEvent.type(screen.getByText('Number of lanes').parentElement.children[1], lanes);

    const addButton = screen.getByText('+');
    for (let i = 0; i < shoes; i++) {
        await userEvent.click(addButton);
        await userEvent.type(
            screen.getByText(`Shoe size / person ${i + 1}`).parentElement.children[1], 
            '42'
        );
    }
};

describe('Bowling Booking System Tests', () => {
    describe('Date and Time Selection', () => {
        it('Should allow user to select date and time', async () => {
            render(<App />);
            const choosetime = screen.getByText('Time').parentElement.children[1];
            const chooseDate = screen.getByText('Date').parentElement.children[1];
            
            fireEvent.change(choosetime, {target: {value: '12:30'}});
            await userEvent.type(chooseDate, '2023-11-15');
            
            expect(choosetime.value).toBe('12:30');
            expect(chooseDate.value).toBe('2023-11-15');
        });
    });

    describe('Players and Lanes Selection', () => {
       

        it('Should allow user to select number of lanes', async () => {
            render(<App />);
            const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];
            
            await userEvent.type(chooseLanes, '2');
            expect(chooseLanes.value).toBe('2');
        });



        it('Should allow user to specify number of players', async () => {
            render(<App />);
            const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
            
            await userEvent.type(choosePlayers, '3');
            expect(choosePlayers.value).toBe('3');

            await userEvent.clear(choosePlayers);
            await userEvent.type(choosePlayers, '0');
            expect(choosePlayers.value).toBe('0');
        });
    });

    describe('Form Validation', () => {
        it('Should show error messages for incomplete form', async () => {
            render(<App />);

            const choosetime = screen.getByText('Time').parentElement.children[1];
            const chooseDate = screen.getByText('Date').parentElement.children[1];
            const choosePlayers = screen.getByText('Number of awesome bowlers').parentElement.children[1];
            const chooseLanes = screen.getByText('Number of lanes').parentElement.children[1];
            const confirmButton = screen.getByText('strIIIIIike!');

            // Test each field individually
            await userEvent.type(choosetime, '11:00');
            await userEvent.click(confirmButton);
            expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

            await userEvent.type(chooseDate, '2024-12-13');
            await userEvent.click(confirmButton);
            expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

            await userEvent.type(choosePlayers, '4');
            await userEvent.click(confirmButton);
            expect(screen.getByText('Alla fälten måste vara ifyllda')).toBeDefined();

            await userEvent.type(chooseLanes, '3');
            await userEvent.click(confirmButton);
            expect(screen.getByText('Antalet skor måste stämma överens med antal spelare')).toBeDefined();
        });

        it('Should prevent booking with insufficient lanes', async () => {
            render(<App />);
            
            await userEvent.type(screen.getByText('Time').parentElement.children[1], '11:00');
            await userEvent.type(screen.getByText('Date').parentElement.children[1], '2024-12-13');
            await userEvent.type(screen.getByText('Number of awesome bowlers').parentElement.children[1], '8');
            await userEvent.type(screen.getByText('Number of lanes').parentElement.children[1], '1');

            const addButton = screen.getByText('+');
            for (let i = 0; i < 8; i++ ) {
                await userEvent.click(addButton);
                await userEvent.type(
                    screen.getByText(`Shoe size / person ${i + 1}`).parentElement.children[1], 
                    '42'
                );
            }

            await userEvent.click(screen.getByText('strIIIIIike!'));
            expect(screen.getByText('Det får max vara 4 spelare per bana')).toBeDefined();
        });
    });

    describe('Shoe Size Selection', () => {


        it('Should validate shoe sizes', async () => {
            render(<App />);

            // Add basic booking details
            await fillBookingForm({ players: '2', lanes: '1', shoes: 1 });

            const confirmButton = screen.getByText('strIIIIIike!');
            
            // Try booking with incomplete shoe sizes
            await userEvent.click(confirmButton);
            expect(screen.getByText('Antalet skor måste stämma överens med antal spelare')).toBeDefined();

            // Add another shoe without size
            const addButton = screen.getByText('+');
            await userEvent.click(addButton);
            await userEvent.click(confirmButton);
            expect(screen.getByText('Alla skor måste vara ifyllda')).toBeDefined();
        });


        it('Should allow adding, changing, and removing shoe sizes', async () => {
            render(<App />);

            const allShoes = screen.getByText('Shoes').parentElement.parentElement;
            expect(allShoes.children.length).toBe(2);
            
            const addButton = screen.getByText('+');
            await userEvent.click(addButton);

            const chooseShoeSize = screen.getByText('Shoe size / person 1').parentElement.children[1];
            expect(chooseShoeSize).toBeDefined();
            
            await userEvent.type(chooseShoeSize, '42');
            expect(chooseShoeSize.value).toBe('42');
            
            await userEvent.clear(chooseShoeSize);
            await userEvent.type(chooseShoeSize, '43');
            expect(chooseShoeSize.value).toBe('43');

            await userEvent.click(addButton);
            const chooseAnotherSize = screen.getByText('Shoe size / person 2').parentElement.children[1];
            await userEvent.type(chooseAnotherSize, '38');
            expect(chooseAnotherSize.value).toBe('38');

            await userEvent.clear(chooseAnotherSize);
            await userEvent.type(chooseAnotherSize, '40');
            expect(chooseAnotherSize.value).toBe('40');

            expect(allShoes.children.length).toBe(4);

            const removeButtons = screen.getAllByText('-');
            await userEvent.click(removeButtons[0]);
            expect(allShoes.children.length).toBe(3);
        });

    });

    describe('Booking Confirmation', () => {
        it('Should complete booking and show confirmation details', async () => {
            render(<App />);

            // Complete the booking form
            await fillBookingForm();

            const confirmButton = screen.getByText('strIIIIIike!');
            await userEvent.click(confirmButton);

            // Check confirmation page navigation
            expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation');

            // Verify confirmation details
            const confirmWhen = screen.getByText('When').parentElement.children[1];
            const confirmWho = screen.getByText('Who').parentElement.children[1];
            const confirmLanes = screen.getByText('Lanes').parentElement.children[1];
            const confirmBookingId = screen.getByText('Booking number').parentElement.children[1];
            const confirmTotalPrice = screen.getByText('Total:').parentElement.children[1];

            expect(confirmWhen.value).toBe('2024-12-13 11:00');
            expect(confirmWho.value).toBe('2');
            expect(confirmLanes.value).toBe('1');
            expect(confirmBookingId.value).toBeDefined();

            const totalPrice = confirmTotalPrice.textContent.slice(0, -4);
            const expectedPrice = (Number(confirmLanes.value) * 100) + (Number(confirmWho.value) * 120);
            expect(Number(totalPrice)).toBeDefined(expectedPrice);

            // Test navigation between pages
            fireEvent.click(screen.getAllByRole('img')[0]);
            fireEvent.click(screen.getByText('Booking'));
            expect(screen.getByRole('navigation').parentElement).toHaveClass('booking');

            await userEvent.click(screen.getAllByRole('img')[0]);
            await userEvent.click(screen.getByText('Confirmation'));
            expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation');

            // Verify details are preserved
            expect(confirmWhen.value).toBe('2024-12-13 11:00');
            expect(confirmWho.value).toBe('2');
            expect(confirmLanes.value).toBe('1');
            expect(confirmBookingId.value).toBeDefined();
        });
    });

    describe('Confirmation View Navigation', () => {
        

        it('Should show stored booking from session storage', async () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route path="/" element={<Booking />} />
                        <Route path="/confirmation" element={<Confirmation />} />
                    </Routes>
                </MemoryRouter>
            );

            // Set sessionStorage with a mock booking
            const confirmation = {
                when: '2024-11-01',
                lanes: '1',
                people: '1',
                shoes: ['46'],
                price: '220',
                id: 'abxc123',
            };
            sessionStorage.setItem("confirmation", JSON.stringify(confirmation));

            // Navigate to confirmation page
            await userEvent.click(screen.getAllByRole('img')[0]);
            await userEvent.click(screen.getByText('Confirmation'));
            expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation');

            // Check booking details are shown
            expect(screen.queryByText('When')).toBeInTheDocument();
            expect(screen.queryByText('Who')).toBeInTheDocument();
            expect(screen.queryByText('Lanes')).toBeInTheDocument();
            expect(screen.queryByText('Booking number')).toBeInTheDocument();
        });
        it('Should show "No booking" message when no booking is made', async () => {
            render(
                <MemoryRouter initialEntries={['/']}>
                    <Routes>
                        <Route path="/" element={<Booking />} />
                        <Route path="/confirmation" element={<Confirmation />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByRole('navigation').parentElement).toHaveClass('booking');
            
            // Visit confirmation page before booking
            await userEvent.click(screen.getAllByRole('img')[0]);
            await userEvent.click(screen.getByText('Confirmation'));
            expect(screen.getByRole('navigation').parentElement).toHaveClass('confirmation');
            
            // Check for no booking details
            expect(screen.queryByText('When')).not.toBeInTheDocument();
            expect(screen.queryByText('Who')).not.toBeInTheDocument();
            expect(screen.queryByText('Lanes')).not.toBeInTheDocument();
            expect(screen.queryByText('Booking number')).not.toBeInTheDocument();

            // Check error message
            expect(screen.getByText('Inga bokning gjord!')).toBeInTheDocument();
        });
    });
});

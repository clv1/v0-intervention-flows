'use client';
import React, { useState } from 'react';
import './athlete-registration.css';
import { checkWhoopCredentials, registerAthlete } from './actions';
import toast, { Toaster } from 'react-hot-toast';

const AthleteRegister = ({ teamID }: { teamID: number }) => {
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const result = await checkWhoopCredentials(formData);

            if (!result || !result.status) {
                throw new Error("Unexpected response from server.");
            }

            if (result.status === 403 || result.status === 401) {
                console.log(teamID);
                toast.error('Invalid Whoop credentials!');
                return;
            }

            if (!result.data || !result.data.user || !result.data.user.id) {
                throw new Error("Invalid response format from API.");
            }

            const whoopUserId = result.data.user.id;
            try {
                await registerAthlete(formData, whoopUserId, teamID);
                toast.success('Athlete registered successfully!');
            } catch (registerError) {
                console.error("Error during athlete registration:", registerError);
                throw new Error("Failed to register athlete. Please try again later.");
            }
        } catch (error) {
            console.error("Error during athlete registration process:", error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    // const testDec = async () => {
    // 	const result = await testAthleteDecryption(10);
    // 	console.log(result);
    // }

    return (
        <div id="athlete-register-page">
            <form onSubmit={handleSubmit}>
                <h1>Athlete Registration</h1>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="first_name">First Name</label>
                        <input id="first_name" name="first_name" type="text" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Last Name</label>
                        <input id="last_name" name="last_name" type="text" required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date_of_birth">Date of Birth</label>
                        <input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="text"
                            placeholder="YYYY-MM-DD"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" name="gender" required>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input id="phone_number" name="phone_number" type="tel" required />
                    </div>
                </div>

                <h3 className="whoop-section-header">Connect your Whoop Device</h3>
                <div className="form-row whoop-section">
                    <div className="form-group">
                        <label htmlFor="whoop_email">Whoop Email</label>
                        <input id="whoop_email" name="whoop_email" type="email" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="whoop_password">Whoop Password</label>
                        <input id="whoop_password" name="whoop_password" type="password" required />
                    </div>
                </div>

                <div className="button-group">
                    <button className="primary-button" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="spinner-container">
                                <div className="spinner">
                                    <svg viewBox="22 22 44 44">
                                        <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" strokeDasharray="80px, 200px" strokeDashoffset="0" className="spinner-circle"></circle>
                                    </svg>
                                </div>
                            </span>
                        ) : (
                            <>Register</>
                        )}
                    </button>
                </div>
                <Toaster position="bottom-right" reverseOrder={false} />
            </form>
        </div>
    );
};

export default AthleteRegister;

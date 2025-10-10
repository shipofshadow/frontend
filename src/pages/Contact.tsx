import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact: React.FC = () => {
    return (
        <section className="py-5 bg-light min-vh-100">
            <div className="container py-5">
                <div className="text-center mt-5">

                    <h2 className="fw-bold display-5 mb-3">Contact Us</h2>
                    <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
                        Have questions about scholarships or your application? We'd love to help!
                        Send us a message and our team will get back to you shortly.
                    </p>
                </div>

                <div className="row g-4 mb-5">
                    {/* Left: Contact Info */}
                    <div className="col-lg-4">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h5 className="card-title fw-bold mb-4">Contact Information</h5>

                                <div className="d-flex align-items-start mb-3 p-3 bg-light rounded">
                                    <Mail className="text-primary me-3 flex-shrink-0" size={20} />
                                    <div>
                                        <small className="text-muted d-block mb-1">Email</small>
                                        <a href="mailto:support@ischolar.xyz" className="text-decoration-none">
                                            support@ischolar.xyz
                                        </a>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-3 p-3 bg-light rounded">
                                    <Phone className="text-primary me-3 flex-shrink-0" size={20} />
                                    <div>
                                        <small className="text-muted d-block mb-1">Phone</small>
                                        <a href="tel:+639123456789" className="text-decoration-none">
                                            +63 912 345 6789
                                        </a>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start p-3 bg-light rounded">
                                    <MapPin className="text-primary me-3 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <small className="text-muted d-block mb-1">Address</small>
                                        <span>
                                            Ilocos Sur Polytechnic State College<br />
                                            Tagudin, Ilocos Sur, Philippines
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <h5 className="card-title fw-bold mb-4">Send us a Message</h5>
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="name" className="form-label fw-semibold">
                                                Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                className="form-control"
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="email" className="form-label fw-semibold">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="form-control"
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="subject" className="form-label fw-semibold">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                className="form-control"
                                                placeholder="How can we help you?"
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="message" className="form-label fw-semibold">
                                                Message <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                className="form-control"
                                                rows={6}
                                                placeholder="Write your message here..."
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary btn-lg px-5">
                                                Send Message
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="card shadow-sm border-0 overflow-hidden">
                    <iframe
                        title="ISPSC Location"
                        src="https://www.google.com/maps?q=Ilocos%20Sur%20Polytechnic%20State%20College%20Tagudin&output=embed"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default Contact;
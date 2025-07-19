import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Package,
      title: 'Smart Inventory',
      description: 'Track your inventory in real-time with automated alerts and smart forecasting.'
    },
    {
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Streamline your order process from creation to fulfillment with ease.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get insights into your business with detailed reports and analytics.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and daily backups.'
    }
  ];

  const benefits = [
    'Real-time inventory tracking',
    'Automated low-stock alerts',
    'Multi-channel order management',
    'Detailed sales analytics',
    'Mobile-responsive design',
    'Cloud-based accessibility'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'IditTrack has revolutionized how I manage my inventory. The real-time tracking saves me hours every week!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'E-commerce Manager',
      content: 'The analytics dashboard gives me insights I never had before. Sales have increased by 30% since we started using IditTrack.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-orange-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simplify Your
              <span className="text-primary-500 block">Inventory Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              IditTrack is the perfect inventory and order management solution for small businesses. 
              Track stock, manage orders, and grow your business with our intuitive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for small businesses to manage inventory and orders efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card p-6 text-center group hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose IditTrack?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for small businesses, IditTrack provides all the tools you need 
                to manage your inventory and orders without the complexity of enterprise solutions.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-bounce-in">
              <div className="card p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="flex items-center space-x-4 mb-6">
                  <Smartphone className="h-12 w-12" />
                  <div>
                    <h3 className="text-2xl font-bold">Mobile Ready</h3>
                    <p className="text-primary-100">Access anywhere, anytime</p>
                  </div>
                </div>
                <p className="text-primary-100 mb-6">
                  Our Progressive Web App works seamlessly on all devices. 
                  Install it on your phone for instant access to your inventory.
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Works Offline</span>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Small Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about IditTrack
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of small businesses using IditTrack to streamline their operations.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
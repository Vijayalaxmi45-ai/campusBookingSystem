export default function CampusMap() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Campus Map</h2>
        <p className="page-subtitle">Interactive map of N.K. Orchid College of Engineering &amp; Technology, Solapur</p>
      </div>
      <div className="card p-0 overflow-hidden" style={{ height: 600 }}>
        <iframe
          title="Campus Map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://maps.google.com/maps?q=N.K.+Orchid+College+of+Engineering+and+Technology,+Gat+No.16,+Solapur-Tuljapur+Road,+Tale-Hipparaga,+near+Mashroom+Ganapati+Temple,+Solapur,+Maharashtra+413002&t=&z=16&ie=UTF8&iwloc=&output=embed"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/* State starting points from the AK9I Student Business Resource Packet, October 2026.1.
   Navigation only. Confirm the current office before acting. */
(function (global) {
  "use strict";

  function link(label, href) {
    return { label: label, href: href };
  }

  function state(name, sbdcHref, econHref, vetHref, workHref) {
    return {
      name: name,
      sbdc: [link("SBDC", sbdcHref)],
      economic: link("Economic development", econHref),
      veterans: link("Veterans services", vetHref),
      workforce: link("Workforce", workHref)
    };
  }

  var states = [
    state("Alabama", "https://asbdc.org/", "https://madeinalabama.com/", "https://va.alabama.gov/", "https://workforce.alabama.gov/"),
    state("Alaska", "https://aksbdc.org/", "https://commerce.alaska.gov/", "https://veterans.alaska.gov/", "https://labor.alaska.gov/"),
    state("Arizona", "https://azsbdc.net/", "https://azcommerce.com/", "https://dvs.az.gov/", "https://arizonaatwork.com/"),
    state("Arkansas", "https://asbtdc.org/", "https://arkansasedc.com/", "https://veterans.arkansas.gov/", "https://dws.arkansas.gov/"),
    {
      name: "California",
      sbdc: [
        link("Regional network 1", "https://norcalsbdc.org/"),
        link("Regional network 2", "https://centralcasbdc.com/"),
        link("Regional network 3", "https://smallbizla.org/"),
        link("Regional network 4", "https://ociesmallbusiness.org/"),
        link("Regional network 5", "https://sdivsbdc.org/")
      ],
      economic: link("Economic development", "https://business.ca.gov/"),
      veterans: link("Veterans services", "https://calvet.ca.gov/"),
      workforce: link("Workforce", "https://edd.ca.gov/")
    },
    state("Colorado", "https://sbdc.colorado.gov/", "https://oedit.colorado.gov/", "https://vets.colorado.gov/", "https://cdle.colorado.gov/"),
    state("Connecticut", "https://ctsbdc.com/", "https://portal.ct.gov/decd", "https://portal.ct.gov/dva", "https://portal.ct.gov/dol"),
    state("Delaware", "https://delawaresbdc.org/", "https://business.delaware.gov/", "https://veteransaffairs.delaware.gov/", "https://labor.delaware.gov/"),
    state("District of Columbia", "https://dcsbdc.org/", "https://dslbd.dc.gov/", "https://communityaffairs.dc.gov/mova", "https://does.dc.gov/"),
    state("Florida", "https://floridasbdc.org/", "https://floridajobs.org/", "https://floridavets.org/", "https://careersourceflorida.com/"),
    state("Georgia", "https://georgiasbdc.org/", "https://georgia.org/", "https://veterans.georgia.gov/", "https://dol.georgia.gov/"),
    state("Hawaii", "https://hisbdc.org/", "https://dbedt.hawaii.gov/", "https://dod.hawaii.gov/ovs", "https://labor.hawaii.gov/wdd"),
    state("Idaho", "https://idahosbdc.org/", "https://commerce.idaho.gov/", "https://veterans.idaho.gov/", "https://labor.idaho.gov/"),
    state("Illinois", "https://dceo.illinois.gov/businesshelp/smallbusinessassistance.html", "https://dceo.illinois.gov/", "https://veterans.illinois.gov/", "https://ides.illinois.gov/"),
    state("Indiana", "https://isbdc.org/", "https://iedc.in.gov/", "https://in.gov/dva", "https://in.gov/dwd"),
    state("Iowa", "https://iowasbdc.org/", "https://opportunityiowa.gov/", "https://dva.iowa.gov/", "https://workforce.iowa.gov/"),
    state("Kansas", "https://kansassbdc.net/", "https://kansascommerce.gov/", "https://kovs.ks.gov/", "https://kansasworks.com/"),
    state("Kentucky", "https://kentuckysbdc.com/", "https://newkentuckyhome.ky.gov/", "https://veterans.ky.gov/", "https://kcc.ky.gov/"),
    state("Louisiana", "https://louisianasbdc.org/", "https://opportunitylouisiana.gov/", "https://vetaffairs.la.gov/", "https://laworks.net/"),
    state("Maine", "https://mainesbdc.org/", "https://maine.gov/decd", "https://maine.gov/veterans", "https://maine.gov/labor"),
    state("Maryland", "https://marylandsbdc.org/", "https://commerce.maryland.gov/", "https://veterans.maryland.gov/", "https://labor.maryland.gov/"),
    state("Massachusetts", "https://msbdc.org/", "https://mass.gov/orgs/executive-office-of-economic-development", "https://mass.gov/orgs/executive-office-of-veterans-services", "https://mass.gov/orgs/executive-office-of-labor-and-workforce-development"),
    state("Michigan", "https://michigansbdc.org/", "https://michiganbusiness.org/", "https://michigan.gov/mvaa", "https://michigan.gov/leo"),
    state("Minnesota", "https://mn.gov/deed/business/help/sbdc", "https://mn.gov/deed", "https://mn.gov/mdva", "https://careerforce.mn.gov/"),
    state("Mississippi", "https://mississippisbdc.org/", "https://mississippi.org/", "https://msva.ms.gov/", "https://mdes.ms.gov/"),
    state("Missouri", "https://sbdc.missouri.edu/", "https://ded.mo.gov/", "https://mvc.dps.mo.gov/", "https://jobs.mo.gov/"),
    state("Montana", "https://commerce.mt.gov/Business/Programs-and-Services/Small-Business-Development-Center/", "https://commerce.mt.gov/", "https://veterans.mt.gov/", "https://dli.mt.gov/"),
    state("Nebraska", "https://unomaha.edu/nebraska-business-development-center", "https://opportunity.nebraska.gov/", "https://veterans.nebraska.gov/", "https://dol.nebraska.gov/"),
    state("Nevada", "https://nevadasbdc.org/", "https://goed.nv.gov/", "https://veterans.nv.gov/", "https://detr.nv.gov/"),
    state("New Hampshire", "https://nhsbdc.org/", "https://nheconomy.com/", "https://nhveterans.nh.gov/", "https://nhes.nh.gov/"),
    state("New Jersey", "https://njsbdc.com/", "https://njeda.gov/", "https://nj.gov/military", "https://nj.gov/labor"),
    state("New Mexico", "https://nmsbdc.org/", "https://edd.newmexico.gov/", "https://dvs.nm.gov/", "https://dws.nm.gov/"),
    state("New York", "https://nysbdc.org/", "https://esd.ny.gov/", "https://veterans.ny.gov/", "https://dol.ny.gov/"),
    state("North Carolina", "https://sbtdc.org/", "https://commerce.nc.gov/", "https://milvets.nc.gov/", "https://ncworks.gov/"),
    state("North Dakota", "https://ndsbdc.org/", "https://commerce.nd.gov/", "https://veterans.nd.gov/", "https://jobsnd.com/"),
    state("Ohio", "https://ohiosbdc.net/", "https://development.ohio.gov/", "https://dvs.ohio.gov/", "https://ohiomeansjobs.ohio.gov/"),
    state("Oklahoma", "https://oksbdc.org/", "https://okcommerce.gov/", "https://oklahoma.gov/veterans", "https://oklahoma.gov/oesc"),
    state("Oregon", "https://oregonsbdc.org/", "https://oregon.gov/biz", "https://oregon.gov/odva", "https://oregon.gov/employ"),
    state("Pennsylvania", "https://pasbdc.org/", "https://dced.pa.gov/", "https://pa.gov/agencies/dmva", "https://pacareerlink.pa.gov/"),
    state("Puerto Rico", "https://prsbtdc.org/", "https://desarrollo.pr.gov/", "https://opv.pr.gov/", "https://trabajo.pr.gov/"),
    state("Rhode Island", "https://web.uri.edu/risbdc", "https://commerceri.com/", "https://vets.ri.gov/", "https://dlt.ri.gov/"),
    state("South Carolina", "https://scsbdc.com/", "https://sccommerce.com/", "https://scdva.sc.gov/", "https://dew.sc.gov/"),
    state("South Dakota", "https://sdbusinesshelp.com/", "https://sdgoed.com/", "https://vetaffairs.sd.gov/", "https://dlr.sd.gov/"),
    state("Tennessee", "https://tsbdc.org/", "https://tnecd.com/", "https://tn.gov/veteran", "https://tn.gov/workforce"),
    {
      name: "Texas",
      sbdc: [
        link("Regional network 1", "https://ntsbdc.org/"),
        link("Regional network 2", "https://nwtsbdc.org/"),
        link("Regional network 3", "https://txsbdc.org/"),
        link("Regional network 4", "https://sbdc.uh.edu/")
      ],
      economic: link("Economic development", "https://gov.texas.gov/business"),
      veterans: link("Veterans services", "https://tvc.texas.gov/"),
      workforce: link("Workforce", "https://twc.texas.gov/")
    },
    state("Utah", "https://utahsbdc.org/", "https://business.utah.gov/", "https://veterans.utah.gov/", "https://jobs.utah.gov/"),
    state("Vermont", "https://vtsbdc.org/", "https://accd.vermont.gov/", "https://veterans.vermont.gov/", "https://labor.vermont.gov/"),
    state("Virginia", "https://virginiasbdc.org/", "https://vedp.org/", "https://dvs.virginia.gov/", "https://virginiaworks.gov/"),
    state("Washington", "https://wsbdc.org/", "https://commerce.wa.gov/", "https://dva.wa.gov/", "https://esd.wa.gov/"),
    state("West Virginia", "https://wvsbdc.com/", "https://westvirginia.gov/", "https://veterans.wv.gov/", "https://workforcewv.org/"),
    state("Wisconsin", "https://wisconsinsbdc.org/", "https://wedc.org/", "https://dva.wi.gov/", "https://dwd.wisconsin.gov/"),
    state("Wyoming", "https://wyomingsbdc.org/", "https://wyomingbusiness.org/", "https://wyomilitary.wyo.gov/veterans", "https://dws.wyo.gov/")
  ];

  global.AK9I_DIRECTORY = states;
})(window);

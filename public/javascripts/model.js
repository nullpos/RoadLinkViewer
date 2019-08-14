export class Link {
    constructor(obj) {
        this.LATITUDE1  = obj.LATITUDE1
        this.LATITUDE2  = obj.LATITUDE2
        this.LONGITUDE1 = obj.LONGITUDE1
        this.LONGITUDE2 = obj.LONGITUDE2
        this.LINK_ID1   = obj.LINK_ID1
        this.NODE1      = obj.NODE1
        this.NODE2      = obj.NODE2
        this.NUM1       = obj.NUM1
        this.NUM2       = obj.NUM2
        this.SCALE      = obj.SCALE
    }

    get distance() {
        return Math.sqrt(Math.pow((this.LATITUDE1 - this.LATITUDE2), 2) + Math.pow((this.LONGITUDE1 - this.LONGITUDE2), 2))
    }

    isConnected(other_link) {
        return ((this.LATITUDE1 === other_link.LATITUDE1) && (this.LONGITUDE1 === other_link.LONGITUDE1)) ||
               ((this.LATITUDE1 === other_link.LATITUDE2) && (this.LONGITUDE1 === other_link.LONGITUDE2)) ||
               ((this.LATITUDE2 === other_link.LATITUDE2) && (this.LONGITUDE2 === other_link.LONGITUDE2)) ||
               ((this.LATITUDE2 === other_link.LATITUDE1) && (this.LONGITUDE2 === other_link.LONGITUDE1))
    }

    get linkID() { return this.LINK_ID1 }
    get latLng1() { return { lat: this.LATITUDE1, lng: this.LONGITUDE1} }
    get latLng2() { return { lat: this.LATITUDE2, lng: this.LONGITUDE2} }
}

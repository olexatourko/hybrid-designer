class LineSegment {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1,
        this.y1 = y1,
        this.x2 = x2,
        this.y2 = y2
    }
}
function extract_line_segments(element) {
    let bounding_rect = element.getBoundingClientRect();

    // Left and right segments
    let left_s = new LineSegment(
        bounding_rect.x,
        bounding_rect.y,
        bounding_rect.x,
        bounding_rect.y + bounding_rect.height
    );
    let right_s = new LineSegment(
        bounding_rect.x + bounding_rect.width,
        bounding_rect.y,
        bounding_rect.x + bounding_rect.width,
        bounding_rect.y + bounding_rect.height
    );

    // Top and bottom segments
    let top_s = new LineSegment(
        bounding_rect.x,
        bounding_rect.y,
        bounding_rect.x + bounding_rect.width,
        bounding_rect.y
    );
    let bottom_s = new LineSegment(
        bounding_rect.x,
        bounding_rect.y + bounding_rect.height,
        bounding_rect.x + bounding_rect.width,
        bounding_rect.y + bounding_rect.height
    );

    return {
        left: left_s,
        right: right_s,
        top: top_s,
        bottom: bottom_s
    }
}

function find_closest_side(from_el, to_el) {
    let from_segments = extract_line_segments(from_el);
    let to_segments = extract_line_segments(to_el);
    let distances = [];
    // Compare horizontal segments
    if (do_segments_share_x(from_segments.top, to_segments.top)) {
        distances.push({
            direction: 'top',
            magnitude: Math.abs(from_segments.top.y1 - to_segments.bottom.y1)
        });
        distances.push({
            direction: 'bottom',
            magnitude: Math.abs(from_segments.bottom.y1 - to_segments.top.y1)
        });
    }
    // Compare vertical segments
    if (do_segments_share_y(from_segments.left, to_segments.left)) {
        distances.push({
            direction: 'left',
            magnitude: Math.abs(from_segments.left.x1 - to_segments.right.x1)
        });
        distances.push({
            direction: 'right',
            magnitude: Math.abs(from_segments.right.x1 - to_segments.left.x1)
        });
    }
    if (distances) {
        let min_distance = distances.pop();
        for (let distance of distances) {
            if (distance.magnitude < min_distance.magnitude) { min_distance = distance }
        }
        return min_distance;
    }
    return null;
}

export default function find_closest_element(target, elements) {
    let closest_element = null;
    for (let candidate of elements) {
        if (candidate == target) { continue; }
        let distance = find_closest_side(target, candidate);
        if (distance && closest_element && distance.magnitude < closest_element.magnitude) {
            closest_element = distance;
            closest_element.element = candidate;
        }
        else if (distance && !closest_element) {
            closest_element = distance;
            closest_element.element = candidate;
        }
    }
    return closest_element;
}

function do_segments_share_x(s_1, s_2) {
    return is_between(s_1.x1, s_2.x1, s_2.x2)
        || is_between(s_1.x2, s_2.x1, s_2.x2)
        || is_between(s_2.x1, s_1.x1, s_1.x2)
        || is_between(s_2.x2, s_1.x2, s_1.x2);
}

function do_segments_share_y(s_1, s_2) {
    return is_between(s_1.y1, s_2.y1, s_2.y2)
        || is_between(s_1.y2, s_2.y1, s_2.y2)
        || is_between(s_2.y1, s_1.y1, s_1.y2)
        || is_between(s_2.y2, s_1.y2, s_1.y2);
}

function is_between(a, b, c) {
    return a >= Math.min(b, c) && a <= Math.max(b, c);
}